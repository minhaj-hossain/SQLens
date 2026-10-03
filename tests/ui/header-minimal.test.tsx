import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../../src/components/layout/Header';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('../../src/components/providers/AuthProvider', () => ({
  useAuth: () => ({ user: null, isAuthPending: false, signOut: async () => {} }),
}));

vi.mock('../../src/components/providers/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'graphite', toggle: vi.fn() }),
}));

vi.mock('../../src/components/learn/use-track', () => ({
  useTrack: () => 'sql',
  useTrackCurriculum: () => ({
    track: 'sql',
    modules: [{ id: 'day-01', title: 'Intro' }],
    milestones: [],
    meta: { id: 'sql', label: 'SQL', basePath: '/sql', title: 'SQLens', tagline: '' },
    getModuleById: () => null,
  }),
}));

vi.mock('motion/react', () => ({
  motion: { span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span> },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../src/components/ui/ResetProgressModal', () => ({
  default: () => null,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const guestState = initialStateForTrack('sql');

const baseProps = {
  userState: guestState,
  onResetProgress: async () => {},
  onOpenSchemaModal: () => {},
  user: null,
  isAuthPending: false,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Header — minimal mode (homepage /)', () => {
  const html = renderToStaticMarkup(<Header {...baseProps} isMinimal={true} />);

  it('renders the Click brand logo and wordmark', () => {
    // The Click variant path is in the SVG
    expect(html).toContain('M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z');
    expect(html).toContain('Click');
  });

  it('uses the 1120px max-width container and h-16', () => {
    expect(html).toContain('max-w-[1120px]');
    expect(html).toContain('h-16');
  });

  it('uses Click homepage background and border colors', () => {
    expect(html).toContain('border-[#121d33]');
  });

  it('renders the circular palette theme button', () => {
    expect(html).toContain('rounded-full');
    // The SVG palette icon circle
    expect(html).toContain('cx="12" cy="12" r="9"');
  });

  it('renders the Sign In button with Click styling (border-[#38bdf8])', () => {
    expect(html).toContain('Sign In');
    expect(html).toContain('border-[#38bdf8]');
    expect(html).toContain('text-[#38bdf8]');
  });

  it('does NOT render the progress pill, playground, or schema modal controls', () => {
    // Streak pill only renders when !isMinimal
    expect(html).not.toContain('days completed');
    expect(html).not.toContain('header-schema-btn');
    // Playground link only appears in full track mode
    expect(html).not.toContain('/playground');
  });
});

describe('Header — full track mode (lesson pages)', () => {
  const html = renderToStaticMarkup(
    <Header {...baseProps} isMinimal={false} activeViewTitle="Learning Path" />,
  );

  it('renders the Click brand logo and links to / in track mode', () => {
    // The Click variant path is in the SVG
    expect(html).toContain('M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z');
    expect(html).toContain('href="/"');
    expect(html).toContain('Click');
  });

  it('uses the 5xl max-width container and h-14', () => {
    expect(html).toContain('max-w-5xl');
    expect(html).toContain('h-14');
  });

  it('renders the sign-in button in the standard track style', () => {
    expect(html).toContain('Sign In');
    expect(html).toContain('bg-func');
  });
});
