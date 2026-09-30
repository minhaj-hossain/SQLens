import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import HeroLensInteractivePreview, {
  ReturningLearnerCard,
} from '@/components/tracks/HeroLensInteractivePreview';
import { TRACK_IDS, TRACK_META } from '@/types/track';
import { getTrackMilestones, getTrackModules } from '@/tracks/registry';

/**
 * TrackSelector — the content of `/` (Phase 2; reshaped by Phase 3, Task 3.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * The homepage is a CHOICE, not a roadmap, and it now DEMONSTRATES the system
 * before asking for that choice: a hero whose live SQL Lens runs the real
 * engine, a continuity strip for learners who already started, feature badges,
 * then two cards — one per track — linking to that track's namespaced roadmap.
 *
 * Still a SERVER component: it reads static curriculum metadata and places the
 * two client islands (`HeroLensInteractivePreview`, `ReturningLearnerCard`), so
 * the headline, badges and cards ship as HTML and the engine chunk arrives only
 * when the island runs.
 */

/** What the platform does, as scannable proof between the hero and the cards. */
const FEATURES = [
  {
    icon: 'database',
    title: 'Zero setup',
    detail: 'A real SQL engine runs in the browser — no install, no server, no waiting.',
  },
  {
    icon: 'code',
    title: 'Typed by design',
    detail: 'Prisma days end in TypeScript: autocomplete and inferred types as you learn.',
  },
  {
    icon: 'schema',
    title: 'ERDs on demand',
    detail: 'Schema diagrams for both tracks, generated from the same source the lessons use.',
  },
  {
    icon: 'terminal',
    title: 'SQL Lens',
    detail: 'Every Prisma call is translated live, statement by statement, with real timings.',
  },
] as const;

export default function TrackSelector() {
  const cards = TRACK_IDS.map((id) => {
    const meta = TRACK_META[id];
    const modules = getTrackModules(id);
    const milestones = getTrackMilestones(id);
    return {
      meta,
      moduleCount: modules.length,
      milestoneCount: milestones.length,
      firstMilestone: milestones[0],
      firstModule: modules[0],
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8 sm:py-16">
      <header className="text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
          Two tracks · one visual learning system
        </p>
        <h1 className="mx-auto max-w-3xl text-2xl font-semibold text-on-surface sm:text-4xl">
          Master the Data Layer: From Bare-Metal SQL to Type-Safe Prisma ORM.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-dim sm:text-base">
          Every day is a stage: mental models, guided practice on a real in-browser engine, then an
          independent challenge. Progress is tracked separately per track, so you can switch at any
          time without losing either path.
        </p>
      </header>

      <ReturningLearnerCard />

      <HeroLensInteractivePreview />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="rounded-lg border border-border bg-surface-2 p-4">
            <Icon name={feature.icon} className="text-[18px] text-func" />
            <p className="mt-2 text-sm font-semibold text-text">{feature.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-text-dim">{feature.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 sm:mt-14">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
          Choose your track
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map(({ meta, moduleCount, milestoneCount, firstMilestone, firstModule }) => (
            <Link
              key={meta.id}
              href={meta.basePath}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-6 transition hover:border-text-dim hover:bg-surface-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-dim"
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded border border-border bg-surface-base px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-text-dim">
                    {meta.label}
                  </span>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] text-text-dim transition group-hover:text-text"
                  />
                </div>

                <h2 className="text-lg font-semibold text-on-surface sm:text-xl">{meta.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">{meta.tagline}</p>

                <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-text-dim">
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Modules</dt>
                    <Icon name="data_object" className="text-[14px]" />
                    <dd>{moduleCount} modules</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Stages</dt>
                    <Icon name="map" className="text-[14px]" />
                    <dd>{milestoneCount} stages</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 border-t border-border-soft pt-4 text-xs text-text-dim">
                {firstMilestone ? (
                  <span>
                    Starts with{' '}
                    <b className="font-semibold text-text">{firstMilestone.title}</b>
                    {firstModule ? ` — ${firstModule.title}` : ''}
                  </span>
                ) : (
                  <span>Curriculum coming soon.</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center font-mono text-[11px] text-text-dim">
        Already started? Open a track and hit Resume on your roadmap.
      </p>
    </div>
  );
}
