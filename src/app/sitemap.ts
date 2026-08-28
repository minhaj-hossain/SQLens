import type { MetadataRoute } from 'next';
import { ALL_MODULES } from '../content/curriculum-index';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';

/**
 * Home + /learn resume + all 25 module overview pages. Stage pages
 * (theory/practice/challenge/complete) are excluded: they are client-gated
 * practice surfaces behind unlock rules, not useful standalone SEO targets.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const learnUrls: MetadataRoute.Sitemap = ALL_MODULES.map((m) => ({
    url: `${SITE_URL}/learn/${m.id}`,
    lastModified,
    changeFrequency: 'weekly',
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
      url: `${SITE_URL}/learn`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...learnUrls,
  ];
}
