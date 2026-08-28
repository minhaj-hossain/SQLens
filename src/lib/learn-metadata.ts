/**
 * Metadata builders for the /learn route tree (Phase 4 SEO layer).
 * Server-only: imports module data (contains non-serializable validators —
 * never pass results across the server→client boundary).
 */
import type { Metadata } from 'next';
import { getModuleById } from '@/content/curriculum-index';
import type { LearnStage } from './learn-routes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';

interface LearnMetadataInput {
  dayId: string;
  stage: LearnStage;
  conceptId?: string;
}

export function learnPageMetadata({ dayId, stage, conceptId }: LearnMetadataInput): Metadata {
  const mod = getModuleById(dayId);
  if (!mod) return {};

  const stageSuffix =
    stage === 'theory' || stage === 'practice'
      ? (mod.concepts.find((c) => c.id === conceptId)?.title ?? '')
      : '';
  const url = `${SITE_URL}/learn/${mod.id}${
    stage === 'theory' || stage === 'practice' ? `/${stage}/${conceptId ?? ''}` : `/${stage}`
  }`;

  const titles: Record<LearnStage, string> = {
    theory: conceptId ? `Day ${mod.day} · ${stageSuffix}` : `Day ${mod.day}: ${mod.title}`,
    practice: conceptId ? `Practice — ${stageSuffix} (Day ${mod.day})` : `Day ${mod.day}: ${mod.title}`,
    challenge: `Independent Challenge — Day ${mod.day}: ${mod.title}`,
    complete: `Day ${mod.day} Complete — ${mod.title}`,
  };

  const descriptions: Record<LearnStage, string> = {
    theory: `Lesson: ${stageSuffix || mod.title}. ${mod.description}`,
    practice: `Guided practice tasks: ${stageSuffix || mod.title}. ${mod.description}`,
    challenge: `Independent challenge for Day ${mod.day} — ${mod.challenge?.title ?? mod.title}. ${mod.description}`,
    complete: `You finished Day ${mod.day} — ${mod.title}. ${mod.description}`,
  };

  return {
    title: titles[stage],
    description: descriptions[stage],
    alternates: { canonical: url },
    openGraph: {
      title: `${titles[stage]} · SQLens`,
      description: descriptions[stage],
      url,
      type: 'website',
      siteName: 'SQLens',
    },
    twitter: { card: 'summary_large_image', title: titles[stage], description: descriptions[stage] },
  };
}

/** JSON-LD LearningResource for a module overview page. */
export function moduleJsonLd(dayId: string): string | null {
  const mod = getModuleById(dayId);
  if (!mod) return null;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Day ${mod.day}: ${mod.title}`,
    description: mod.description,
    url: `${SITE_URL}/learn/${mod.id}`,
    timeRequired: `PT${mod.estimatedMinutes}M`,
    educationalLevel: 'Beginner',
    teaches: mod.concepts.map((c) => c.title),
    provider: { '@type': 'Organization', name: 'SQLens', url: SITE_URL },
    isAccessibleForFree: true,
  });
}
