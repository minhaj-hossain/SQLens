/**
 * Phase 2 — namespaced track routing (/sql/* + /prisma/*).
 *
 * Two things are locked down here:
 *   1. The track is derived from the URL, so every shared view resolves the
 *      right curriculum without a provider or prop drilling.
 *   2. The SQL contract is FROZEN: `learn-routes.ts` still emits the pre-Phase-2
 *      `/learn/...` shape, and `next.config.ts` redirects those to `/sql/...`.
 *      If someone "tidies up" those builders, this suite fails on purpose —
 *      indexed URLs and bookmarks depend on them.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TRACK_IDS, TRACK_META, isTrackId } from '../../src/types/track';
import {
  getTrackPreviousStep,
  trackConceptIdFromPathname,
  trackFromPathname,
  trackLearnUrl,
  trackModuleIdFromPathname,
  trackRoadmapUrl,
} from '../../src/lib/track-routes';
import {
  assertNoModuleIdCollision,
  getTrackMilestones,
  getTrackModuleById,
  getTrackModules,
} from '../../src/tracks/registry';
import { ALL_MODULES } from '../../src/content/sql/curriculum-index';
import { getPreviousStep, learnUrl, roadmapUrl } from '../../src/lib/learn-routes';

describe('Phase 2 — namespaced track routing', () => {
  it('classifies a pathname into its track; non-track paths default to SQL', () => {
    expect(trackFromPathname('/sql')).toBe('sql');
    expect(trackFromPathname('/sql/learn/day-01')).toBe('sql');
    expect(trackFromPathname('/prisma')).toBe('prisma');
    expect(trackFromPathname('/prisma/learn/prisma-01/theory/x')).toBe('prisma');

    // No track prefix -> `useTrack()` falls back to 'sql', which is exactly the
    // pre-Phase-2 behaviour for the selector and any legacy surface.
    expect(trackFromPathname('/')).toBeNull();
    expect(trackFromPathname('/learn/day-01')).toBeNull();
    expect(trackFromPathname('/admin')).toBeNull();
    expect(trackFromPathname(null)).toBeNull();
  });

  it('parses module + concept ids out of namespaced paths (both id shapes)', () => {
    expect(trackModuleIdFromPathname('/sql/learn/day-57/challenge')).toBe('day-57');
    expect(trackModuleIdFromPathname('/prisma/learn/prisma-01')).toBe('prisma-01');
    expect(trackModuleIdFromPathname('/prisma/learn/prisma-14/complete')).toBe('prisma-14');
    // The legacy shape is deliberately NOT matched: `dayIdFromPathname` owns
    // those, and the route itself is redirected to /sql/*.
    expect(trackModuleIdFromPathname('/learn/day-01')).toBeNull();

    expect(trackConceptIdFromPathname('/sql/learn/day-02/theory/select-basics')).toBe(
      'select-basics',
    );
    expect(
      trackConceptIdFromPathname('/prisma/learn/prisma-01/practice/raw-sql-vs-prisma'),
    ).toBe('raw-sql-vs-prisma');
  });

  it('builds namespaced roadmap + learn URLs per track', () => {
    expect(trackRoadmapUrl('sql')).toBe('/sql');
    expect(trackRoadmapUrl('sql', 'day-01')).toBe('/sql?highlight=day-01');
    expect(trackRoadmapUrl('prisma')).toBe('/prisma');
    expect(trackRoadmapUrl('prisma', 'prisma-01')).toBe('/prisma?highlight=prisma-01');

    expect(trackLearnUrl('sql', 'day-03', 'theory', 'filtering')).toBe(
      '/sql/learn/day-03/theory/filtering',
    );
    expect(trackLearnUrl('sql', 'day-03', 'practice', 'filtering', 2)).toBe(
      '/sql/learn/day-03/practice/filtering?task=2',
    );
    expect(trackLearnUrl('prisma', 'prisma-01', 'challenge')).toBe(
      '/prisma/learn/prisma-01/challenge',
    );
    expect(trackLearnUrl('prisma', 'prisma-01', 'complete')).toBe(
      '/prisma/learn/prisma-01/complete',
    );
  });

  it('step-chain Back never leaks across tracks', () => {
    const concepts = ['a', 'b'];

    // previous concept (no tasks) -> its theory, same track
    expect(
      getTrackPreviousStep('sql', 'day-01', '/sql/learn/day-01/theory/b', concepts, null),
    ).toEqual({
      url: '/sql/learn/day-01/theory/a',
      label: 'Back',
      hint: 'Back to Lesson',
    });
    expect(
      getTrackPreviousStep('prisma', 'prisma-01', '/prisma/learn/prisma-01/theory/b', concepts, null)
        ?.url,
    ).toBe('/prisma/learn/prisma-01/theory/a');

    // first concept -> the track's OWN roadmap, highlighting the module card
    expect(
      getTrackPreviousStep('sql', 'day-01', '/sql/learn/day-01/theory/a', concepts, null)?.url,
    ).toBe('/sql?highlight=day-01');
    expect(
      getTrackPreviousStep('prisma', 'prisma-01', '/prisma/learn/prisma-01/theory/a', concepts, null)
        ?.url,
    ).toBe('/prisma?highlight=prisma-01');

    // task N -> task N-1, still namespaced
    expect(
      getTrackPreviousStep('sql', 'day-01', '/sql/learn/day-01/practice/a', concepts, '2', { a: 3 })
        ?.url,
    ).toBe('/sql/learn/day-01/practice/a?task=1');

    // challenge -> last concept's last task
    expect(
      getTrackPreviousStep(
        'prisma',
        'prisma-01',
        '/prisma/learn/prisma-01/challenge',
        concepts,
        null,
        { a: 2, b: 3 },
      )?.url,
    ).toBe('/prisma/learn/prisma-01/practice/b?task=2');

    // the overview itself has no back step (the roadmap link covers it)
    expect(getTrackPreviousStep('sql', 'day-01', '/sql/learn/day-01', concepts, null)).toBeNull();
  });

  it('SQL builders stay FROZEN — the pre-Phase-2 /learn URL shape still resolves', () => {
    expect(learnUrl('day-01', 'theory', 'select-basics')).toBe('/learn/day-01/theory/select-basics');
    expect(learnUrl('day-01', 'practice', 'select-basics', 1)).toBe(
      '/learn/day-01/practice/select-basics?task=1',
    );
    expect(roadmapUrl('day-01')).toBe('/?highlight=day-01');
    expect(roadmapUrl()).toBe('/');

    // getPreviousStep still speaks the legacy shape (back-nav.test.ts covers it
    // in depth); next.config.ts is what bridges /learn/* -> /sql/learn/*.
    expect(typeof getPreviousStep).toBe('function');
  });

  it('every track is renderable from its own metadata alone', () => {
    for (const id of TRACK_IDS) {
      expect(isTrackId(id)).toBe(true);
      const meta = TRACK_META[id];
      expect(meta.basePath).toBe(`/${id}`);
      expect(meta.initialModuleId).toBeTruthy();
      expect(getTrackModules(id).length).toBeGreaterThan(0);
      expect(getTrackMilestones(id).length).toBeGreaterThan(0);
      // The roadmap's first card must resolve, or /:track would render empty.
      expect(getTrackModuleById(id, meta.initialModuleId)).toBeDefined();
    }
  });

  it('the SQL track still hands back the untouched 57-day array by reference', () => {
    expect(getTrackModules('sql')).toBe(ALL_MODULES);
    expect(ALL_MODULES.length).toBe(57);
    expect(ALL_MODULES[0].id).toBe('day-01');
  });

  it('no module id collides across tracks', () => {
    expect(assertNoModuleIdCollision()).toEqual([]);
  });

  it('learn index entry pages use deriveLastPosition and isProgressReady', () => {
    const sqlSrc = readFileSync('src/app/(app)/sql/learn/page.tsx', 'utf8');
    const prismaSrc = readFileSync('src/app/(app)/prisma/learn/page.tsx', 'utf8');

    for (const src of [sqlSrc, prismaSrc]) {
      expect(src).toContain('deriveLastPosition');
      expect(src).toContain('isProgressReady');
      expect(src).not.toContain('userState.currentModuleId');
    }
  });

  it('AuthScreen, Playground and Header preserve route context and return targets', () => {
    const authSrc = readFileSync('src/components/auth/AuthScreen.tsx', 'utf8');
    const playSrc = readFileSync('src/app/playground/page.tsx', 'utf8');
    const headerSrc = readFileSync('src/components/layout/Header.tsx', 'utf8');

    expect(authSrc).toContain('useSearchParams');
    expect(authSrc).toContain('sanitizeReturnUrl');
    expect(authSrc).toContain('returnTarget');

    expect(playSrc).toContain('useSearchParams');
    expect(playSrc).toContain('sanitizeReturnUrl');
    expect(playSrc).toContain('/prisma');
    expect(playSrc).toContain('/sql');
    expect(playSrc).not.toContain("onClose={() => router.push('/')}");

    expect(headerSrc).toContain('usePathname');
    expect(headerSrc).toContain('signin?from=');
    expect(headerSrc).toContain('playground?mode=prisma');
  });

  it('Phase 4: ChallengeView back navigation targets the last task of the last concept', () => {
    const challengeSrc = readFileSync('src/components/learn/ChallengeView.tsx', 'utf8');
    const independentChallengeSrc = readFileSync(
      'src/components/learning/IndependentChallengeView.tsx',
      'utf8',
    );

    // Verifies ChallengeView calculates last concept's last task index dynamically
    expect(challengeSrc).toContain('Math.max(0, taskCount - 1)');
    expect(challengeSrc).not.toContain("trackLearnUrl(track, mod.id, 'practice', last.id, 0)");

    // Verifies IndependentChallengeView renders the Back button with challenge-back-btn id
    expect(independentChallengeSrc).toContain('id="challenge-back-btn"');
    expect(independentChallengeSrc).toContain('onBackToPractice');
  });

  it('Phase 5: Hydration shells & skeleton fallbacks replace blank null returns', () => {
    const layoutSrc = readFileSync('src/components/learn/TrackDayLayoutView.tsx', 'utf8');
    const practiceSrc = readFileSync('src/components/learn/PracticeView.tsx', 'utf8');

    // Verifies TrackDayLayoutView renders TrackDaySkeleton shell instead of return null
    expect(layoutSrc).toContain('TrackDaySkeleton');
    expect(layoutSrc).not.toContain('if (!isProgressReady) return null;');

    // Verifies PracticeView provides PracticeSkeleton in Suspense fallback
    expect(practiceSrc).toContain('<Suspense fallback={<PracticeSkeleton />}>');
    expect(practiceSrc).not.toContain('<Suspense fallback={null}>');
  });

  it('Phase 6: Action labels polish, not-found routing, and homepage widget contracts', () => {
    const conceptLessonSrc = readFileSync('src/components/learning/ConceptLessonView.tsx', 'utf8');
    const practiceTaskSrc = readFileSync('src/components/learning/PracticeTaskView.tsx', 'utf8');
    const notFoundSrc = readFileSync('src/app/not-found.tsx', 'utf8');
    const homepageSrc = readFileSync('src/components/home/ClickHomepage.tsx', 'utf8');

    // 6.1 & 6.2: Homepage returning learner card contract
    expect(homepageSrc).toContain('returning-learner-card');
    expect(homepageSrc).toContain('resume-learning-btn');
    expect(homepageSrc).toContain('deriveLastPosition');

    // 6.3: ConceptLessonView label polish when concept.tasks.length === 0
    expect(conceptLessonSrc).toContain("concept.tasks.length === 0 ? 'Complete Concept & Continue' : 'Continue to Practice'");

    // 6.4: PracticeTaskView checks hasChallenge before Module Challenge vs Complete Module
    expect(practiceTaskSrc).toContain('hasChallenge');
    expect(practiceTaskSrc).toContain("'Complete Module'");

    // 6.5: not-found routes directly to /sql and /prisma
    expect(notFoundSrc).toContain('href="/sql"');
    expect(notFoundSrc).toContain('href="/prisma"');
    expect(notFoundSrc).not.toContain('lives at the root of the site');
  });
});



