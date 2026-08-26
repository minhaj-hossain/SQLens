import type { Metadata, Viewport } from 'next';
import React from 'react';
import { Space_Grotesk, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Self-hosted via next/font: preloaded, non-blocking, zero layout shift.
// Only families + weights actually referenced by globals.css are loaded
// (the previous Google Fonts URL also shipped unused Hanken Grotesk & Inter).
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlens-ruddy.vercel.app';
const TITLE = 'SQLens — Learn SQL by Doing, 25 Days Hands-On';
const DESCRIPTION =
  'Master SQL in 25 days through visual mental models, an interactive in-browser query engine, guided practice tasks and independent challenges. No setup required.';

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
  themeColor: '#0A0D12',
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
      className={`dark ${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
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
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
