import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SQL Playground',
  description:
    'A standalone in-browser SQL playground: multi-statement scripts, history, CSV export, lesson/scratch database switcher and Ctrl+Space autocomplete.',
};

// Metadata-only layout — the playground renders itself full-screen.
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
