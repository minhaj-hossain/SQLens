import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ReturningLearnerCard } from '@/components/tracks/HeroLensInteractivePreview';
import { TRACK_IDS, TRACK_META } from '@/types/track';
import { getTrackMilestones, getTrackModules } from '@/tracks/registry';

/**
 * TrackSelector — the content of `/`.
 * Minimal track selection hub allowing learners to pick between SQL and Prisma.
 */

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
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
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

      <div className="mt-10 sm:mt-12">
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
    </div>
  );
}
