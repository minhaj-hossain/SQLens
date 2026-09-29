import React from 'react';
import type { Metadata } from 'next';
import { PRISMA_MODULES } from '@/content/prisma/prisma-curriculum-index';
import { learnPageMetadata, moduleJsonLd } from '@/lib/learn-metadata';
import ModuleOverview from '@/components/learn/ModuleOverview';

/**
 * Server page wrapper (Phase 4 SEO layer) for the PRISMA track: the module
 * shells are statically prerendered from PRISMA_MODULES; metadata + JSON-LD
 * render on the server while the interactive overview stays client-side
 * (module data contains non-serializable validators, so only the serializable
 * module id crosses the boundary).
 *
 * NOTE: the param is still named `dayId` so this file stays byte-identical to
 * its /sql counterpart apart from the three track-specific lines below.
 */
export function generateStaticParams() {
  return PRISMA_MODULES.map((m) => ({ dayId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ dayId: string }> }): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ track: 'prisma', dayId, stage: 'theory' });
}

export default async function DayOverviewPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  const jsonLd = moduleJsonLd(dayId, 'prisma');

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
