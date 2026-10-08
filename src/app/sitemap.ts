import type { MetadataRoute } from 'next';
import { ALL_MODULES } from '../content/sql/curriculum-index';
import { PRISMA_MODULES } from '../content/prisma/prisma-curriculum-index';
import { TRACK_META } from '../types/track';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';

/**
 * Phase 2 — both tracks are now first-class, namespaced surfaces:
 *   /                    track selector
 *   /sql  /prisma        each track's roadmap
 *   /[track]/learn       resume point
 *   /[track]/learn/<id>  module overviews
 *
 * Stage pages (theory/practice/challenge/complete) stay excluded: they are
 * client-gated practice surfaces behind unlock rules, not standalone SEO
 * targets. SQL paths moved under /sql in Phase 2, so they are emitted from
 * TRACK_META rather than hardcoded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const sqlBase = TRACK_META.sql.basePath;
  const prismaBase = TRACK_META.prisma.basePath;

  const moduleUrls = (basePath: string): MetadataRoute.Sitemap =>
    [...ALL_MODULES, ...PRISMA_MODULES]
      .filter((m) => (basePath === prismaBase ? m.id.startsWith('prisma-') : !m.id.startsWith('prisma-')))
      .map((m) => ({
        url: `${SITE_URL}${basePath}/learn/${m.id}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}${sqlBase}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${prismaBase}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${sqlBase}/learn`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${prismaBase}/learn`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...moduleUrls(sqlBase),
    ...moduleUrls(prismaBase),
  ];
}
