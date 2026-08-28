import React from 'react';
import type { Metadata } from 'next';
import { ALL_MODULES } from '@/content/curriculum-index';
import { learnPageMetadata, moduleJsonLd } from '@/lib/learn-metadata';
import ModuleOverview from '@/components/learn/ModuleOverview';

/**
 * Server page wrapper (Phase 4 SEO layer): the 25 day shells are statically
 * prerendered; metadata + JSON-LD render on the server while the interactive
 * overview stays client-side (module data contains non-serializable
 * validators, so only the serializable dayId crosses the boundary).
 */
export function generateStaticParams() {
  return ALL_MODULES.map((m) => ({ dayId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ dayId: string }> }): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ dayId, stage: 'theory' });
}

export default async function DayOverviewPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  const jsonLd = moduleJsonLd(dayId);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <ModuleOverview dayId={dayId} />
    </>
  );
}
