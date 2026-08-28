import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';

export const metadata: Metadata = {
  title: 'SQL Playground',
  description:
    'A standalone in-browser SQL playground: multi-statement scripts, history, CSV export, lesson/scratch database switcher and Ctrl+Space autocomplete.',
  alternates: { canonical: `${SITE_URL}/playground` },
  openGraph: {
    title: 'SQL Playground · SQLens',
    description:
      'Write and run real SQL in your browser — multi-statement scripts, history, CSV export and autocomplete. No setup required.',
    url: `${SITE_URL}/playground`,
    type: 'website',
    siteName: 'SQLens',
  },
};

// Metadata-only layout — the playground renders itself full-screen.
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

