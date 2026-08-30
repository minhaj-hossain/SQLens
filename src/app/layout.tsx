import type { Metadata, Viewport } from 'next';
import React from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Self-hosted via next/font: preloaded, non-blocking, zero layout shift.
// Inter (display + body) + JetBrains Mono (code / labels) — the only two
// families in the visual system.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';
const TITLE = 'SQLens — Learn SQL by Doing, 38 Days Hands-On';
const DESCRIPTION =
  'Master SQL in 38 Days through visual mental models, an interactive in-browser query engine, guided practice tasks and independent challenges. No setup required.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · SQLens',
  },
  description: DESCRIPTION,
  applicationName: 'SQLens',
  keywords: [
    'learn SQL',
    'SQL course',
    'SQL practice',
    'interactive SQL',
    'SQL tutorial',
    'database queries',
    'SELECT',
    'JOINs',
    'SQL for beginners',
  ],
  authors: [{ name: 'SQLens' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'SQLens',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'SQLens',
              url: SITE_URL,
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              description: DESCRIPTION,
            }),
          }}
        />
      </head>
      <body className="bg-ink text-text antialiased">{children}</body>
    </html>
  );
}
