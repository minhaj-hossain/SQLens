import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth + admin surfaces are private; keep crawlers out.
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
