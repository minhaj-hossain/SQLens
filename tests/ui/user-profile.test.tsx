import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileSkeleton } from '../../src/components/profile/ProfileSkeleton';
import { UserProfileView } from '../../src/components/profile/UserProfileView';
import { metadata } from '../../src/app/(app)/profile/page';

// ── Mock Auth Provider ────────────────────────────────────────────────────────

let mockAuthUser: {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
} | null = null;
let mockIsAuthPending = false;
const mockSignOut = vi.fn();

vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isAuthPending: mockIsAuthPending,
    signOut: mockSignOut,
  }),
}));

vi.mock('@/components/ui/ResetProgressModal', () => ({
  default: () => null,
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('User Profile & Learning Progress Hub', () => {
  beforeEach(() => {
    mockAuthUser = null;
    mockIsAuthPending = false;
    vi.clearAllMocks();
  });

  describe('ProfileSkeleton component', () => {
    it('renders with accessibility attributes and zero-layout-shift structure', () => {
      const html = renderToStaticMarkup(<ProfileSkeleton />);

      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('aria-label="Loading learner profile and progress"');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('max-w-5xl');
    });
  });

  describe('UserProfileView — Guest Learner', () => {
    it('renders guest identity card with local browser progress and sign-in CTA', () => {
      mockAuthUser = null;
      const html = renderToStaticMarkup(<UserProfileView />);

      expect(html).toContain('Guest Learner');
      expect(html).toContain('Local Browser Progress');
      expect(html).toContain('href="/signin?from=/profile"');
      expect(html).toContain('Sign in to Cloud Sync');
      expect(html).toContain('You are browsing in guest mode');
    });

    it('renders all 4 KPI summary cards with expected metrics', () => {
      mockAuthUser = null;
      const html = renderToStaticMarkup(<UserProfileView />);

      expect(html).toContain('Days Cleared');
      expect(html).toContain('Tasks Solved');
      expect(html).toContain('Challenges');
      expect(html).toContain('Overall Progress');
    });

    it('renders all 3 track cards with badges and resume links', () => {
      mockAuthUser = null;
      const html = renderToStaticMarkup(<UserProfileView />);

      // SQL Track
      expect(html).toContain('id="profile-track-sql"');
      expect(html).toContain('SQL Track');
      expect(html).toContain('57 Days');
      expect(html).toContain('id="profile-resume-sql-btn"');
      expect(html).toContain('href="/sql"');
      expect(html).toContain('href="/sql/learn/day-01/theory/select-and-from"');

      // Prisma Track
      expect(html).toContain('id="profile-track-prisma"');
      expect(html).toContain('Prisma Track');
      expect(html).toContain('14 Days');
      expect(html).toContain('id="profile-resume-prisma-btn"');
      expect(html).toContain('href="/prisma"');
      expect(html).toContain('href="/prisma/learn/prisma-01/theory/model-and-scalar-types"');

      // Networking Track
      expect(html).toContain('id="profile-track-networking"');
      expect(html).toContain('Networking Track');
      expect(html).toContain('Interactive Packet &amp; Topology Lab');
      expect(html).toContain('Open Lab');
    });

    it('renders data management trigger for resetting progress', () => {
      mockAuthUser = null;
      const html = renderToStaticMarkup(<UserProfileView />);

      expect(html).toContain('Reset Curriculum Progress…');
      expect(html).toContain('Data &amp; Storage Management');
    });
  });

  describe('UserProfileView — Authenticated Learner', () => {
    it('renders authenticated identity card with user initials, name, email and cloud-synced status', () => {
      mockAuthUser = {
        id: 'usr_premium_123',
        name: 'Maria Gomez',
        email: 'maria@example.com',
        role: 'user',
      };
      const html = renderToStaticMarkup(<UserProfileView />);

      expect(html).toContain('Maria Gomez');
      expect(html).toContain('MG');
      expect(html).toContain('maria@example.com');
      expect(html).toContain('Cloud Sync Active');
      expect(html).toContain('Sign out');
    });

    it('renders admin badge when user role is admin', () => {
      mockAuthUser = {
        id: 'usr_admin_456',
        name: 'Admin User',
        email: 'admin@click.dev',
        role: 'admin',
      };
      const html = renderToStaticMarkup(<UserProfileView />);

      expect(html).toContain('Admin');
    });
  });

  describe('Profile Page route (/profile)', () => {
    it('defines authoritative Click metadata for the user profile page', () => {
      expect(metadata.title).toBe('My Profile & Learning Progress · Click');
      expect(metadata.description).toContain('SQL, Prisma ORM, and Networking progress');
    });
  });
});
