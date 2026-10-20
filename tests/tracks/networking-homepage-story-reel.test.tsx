import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingTrackHomePage } from '../../src/components/learning/networking/homepage/NetworkingTrackHomePage';
import { StoryReelStage, NET_01_STORY_SCENES } from '../../src/components/learning/networking/StoryReelStage';
import { NETWORKING_MODULES } from '../../src/content/networking/networking-curriculum-index';
import { NETWORKING_ROADMAP_MILESTONES } from '../../src/content/networking/networking-roadmap';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';

// Mocks for Next.js navigation & track providers
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/networking',
}));

vi.mock('../../src/components/learn/use-track', () => ({
  useTrackCurriculum: () => ({
    track: 'networking',
    modules: NETWORKING_MODULES,
    milestones: NETWORKING_ROADMAP_MILESTONES,
    meta: {
      id: 'networking',
      name: 'Networking',
      title: 'Networking Fundamentals',
    },
    getModuleById: (id: string) => NETWORKING_MODULES.find((m) => m.id === id),
  }),
}));

vi.mock('../../src/components/providers/LearningProgressProvider', () => ({
  useLearning: () => ({
    userState: initialStateForTrack('networking'),
    isProgressReady: true,
    resetProgress: vi.fn(),
    resetError: null,
  }),
}));

describe('Networking Dedicated Homepage & Story Reel Suite', () => {
  describe('NetworkingTrackHomePage Component', () => {
    const html = renderToStaticMarkup(<NetworkingTrackHomePage />);

    it('renders the unique NOC Hero with high-impact value proposition', () => {
      expect(html).toContain('ZERO JARGON TO JOB-READY ADMIN');
      expect(html).toContain('Master Networking From the');
      expect(html).toContain('Physical Wire');
      expect(html).toContain('Interactive Story Reels');
      expect(html).toContain('Guided Workplace Labs');
    });

    it('renders the live interactive topology simulator in the hero', () => {
      expect(html).toContain('LIVE TOPOLOGY SIMULATOR');
      expect(html).toContain('Host-A');
      expect(html).toContain('SW-1');
      expect(html).toContain('R-1');
      expect(html).toContain('Internet');
      expect(html).toContain('Send Test Packet');
    });

    it('renders the 3-Beat Golden Pedagogy comparison cards', () => {
      expect(html).toContain('The Physical Dilemma First');
      expect(html).toContain('The Interactive Story Reel');
      expect(html).toContain('The Guided Workplace Lab');
    });

    it('renders the 7 Milestones and 16 Workplace Modules', () => {
      expect(html).toContain('7 Milestones • 16 Workplace Modules');
      expect(html).toContain('MILESTONE 1');
      expect(html).toContain('Local Link &amp; Switching');
      expect(html).toContain('Module 1');
      expect(html).toContain('Story Reel');
      expect(html).toContain('Admin Lab');
    });

    it('renders the dedicated footer with cross-track links', () => {
      expect(html).toContain('Click • Networking Fundamentals Track');
      expect(html).toContain('SQL Track (57 Days)');
      expect(html).toContain('Prisma ORM Track (14 Days)');
    });
  });

  describe('StoryReelStage Component', () => {
    it('defines 3 sequential scenes with zero-jargon progression', () => {
      expect(NET_01_STORY_SCENES.length).toBe(3);
      expect(NET_01_STORY_SCENES[0].title).toBe('The Solitary Machine');
      expect(NET_01_STORY_SCENES[1].title).toBe('The Copper Link & Voltage Pulse');
      expect(NET_01_STORY_SCENES[2].title).toBe('The Factory-Burned Hardware Serial Number');
    });

    it('renders Scene 1 with solitary machine and baseline dilemma in SSR markup', () => {
      const html = renderToStaticMarkup(<StoryReelStage />);
      expect(html).toContain('INTERACTIVE STORY REEL • SCENE 1 OF 3');
      expect(html).toContain('The Solitary Machine');
      expect(html).toContain('Computer A (Isolated)');
      expect(html).toContain('Physical Link: Disconnected');
    });
  });
});
