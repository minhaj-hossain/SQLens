import { describe, it, expect } from 'vitest';
import {
  getUserInitials,
  getTrackSummary,
  getProfileLearningSummary,
  getNetworkingSummary,
} from '@/lib/progress/profile-progress';
import { initialStateForTrack } from '@/lib/progress/storage';
import { UserLearningState } from '@/types/progress';

describe('profile-progress: getUserInitials', () => {
  it('extracts first and last initials from full names', () => {
    expect(getUserInitials('Minhaj Hossain')).toBe('MH');
    expect(getUserInitials('Ada Lovelace Smith')).toBe('AS');
  });

  it('extracts two letters from a single name', () => {
    expect(getUserInitials('Alice')).toBe('AL');
  });

  it('falls back to email initial when name is absent', () => {
    expect(getUserInitials(null, 'learner@click.dev')).toBe('L');
    expect(getUserInitials('', 'john.doe@example.com')).toBe('J');
  });

  it('returns fallback question mark for empty or missing inputs', () => {
    expect(getUserInitials(null, null)).toBe('?');
    expect(getUserInitials('   ', '')).toBe('?');
  });
});

describe('profile-progress: getTrackSummary', () => {
  it('returns clean unstarted state for fresh SQL track', () => {
    const freshState = initialStateForTrack('sql');
    const summary = getTrackSummary('sql', freshState);

    expect(summary.track).toBe('sql');
    expect(summary.totalModules).toBe(57);
    expect(summary.completedModules).toBe(0);
    expect(summary.percent).toBe(0);
    expect(summary.isStarted).toBe(false);
    expect(summary.isCompleted).toBe(false);
    expect(summary.currentDayNumber).toBe(1);
    expect(summary.currentMilestoneTitle).toBe('Foundations');
    expect(summary.currentMilestoneOrder).toBe(1);
    expect(summary.resumeUrl).toContain('/sql/learn/day-01');
  });

  it('computes accurate progress and milestone for partially completed SQL track', () => {
    const partialState: UserLearningState = {
      ...initialStateForTrack('sql'),
      completedModules: {
        'day-01': {
          completedAt: '2026-10-25T10:00:00Z',
          moduleId: 'day-01',
          completedTasks: ['d1-c1-t1', 'd1-c1-t2'],
          challengeCompleted: true,
        },
        'day-02': {
          completedAt: '2026-10-26T10:00:00Z',
          moduleId: 'day-02',
          completedTasks: ['d2-c1-t1'],
          challengeCompleted: true,
        },
      },
      completedConcepts: {
        'day-01-c1': { completedAt: '2026-10-25T10:00:00Z', conceptId: 'day-01-c1', moduleId: 'day-01' },
      },
      completedTasks: {
        'd1-c1-t1': { completedAt: '2026-10-25T10:00:00Z', taskId: 'd1-c1-t1', moduleId: 'day-01', conceptId: 'day-01-c1' },
      },
      lastActiveTimestamp: '2026-10-26T15:30:00Z',
    };

    const summary = getTrackSummary('sql', partialState);
    expect(summary.completedModules).toBe(2);
    expect(summary.completedChallenges).toBe(2);
    expect(summary.percent).toBe(Math.round((2 / 57) * 100)); // ~4%
    expect(summary.isStarted).toBe(true);
    expect(summary.currentDayNumber).toBe(3); // Day 3 is next up
    expect(summary.currentMilestoneTitle).toBe('Foundations');
    expect(summary.lastActiveTimestamp).toBe('2026-10-26T15:30:00Z');
  });

  it('computes accurate progress for Prisma track', () => {
    const freshPrisma = initialStateForTrack('prisma');
    const summary = getTrackSummary('prisma', freshPrisma);

    expect(summary.track).toBe('prisma');
    expect(summary.totalModules).toBe(14);
    expect(summary.completedModules).toBe(0);
    expect(summary.percent).toBe(0);
    expect(summary.currentDayNumber).toBe(1);
    expect(summary.resumeUrl).toContain('/prisma/learn/prisma-01');
  });
});

describe('profile-progress: getNetworkingSummary', () => {
  it('returns networking summary with active modules', () => {
    const summary = getNetworkingSummary();
    expect(summary.track).toBe('networking');
    expect(summary.totalModules).toBeGreaterThanOrEqual(9);
    expect(summary.resumeUrl).toBe('/networking/learn/net-01');
    expect(summary.basePath).toBe('/networking');
  });
});

describe('profile-progress: getProfileLearningSummary', () => {
  it('generates complete guest summary with local storage indicator', () => {
    const summary = getProfileLearningSummary(null, {
      sql: initialStateForTrack('sql'),
      prisma: initialStateForTrack('prisma'),
    });

    expect(summary.user.isGuest).toBe(true);
    expect(summary.user.name).toBe('Guest Learner');
    expect(summary.syncStatus.isCloudSynced).toBe(false);
    expect(summary.globalStats.totalDaysCompleted).toBe(0);
    expect(summary.globalStats.totalDaysAvailable).toBe(57 + 14 + summary.tracks.networking.totalModules);
  });

  it('generates authenticated user summary with consolidated stats', () => {
    const authUser = {
      id: 'usr_abc123',
      name: 'Sarah Connor',
      email: 'sarah@skynet.resistance',
      role: 'admin',
    };

    const mockSqlState: UserLearningState = {
      ...initialStateForTrack('sql'),
      completedModules: {
        'day-01': { completedAt: '2026-10-20', moduleId: 'day-01', completedTasks: [], challengeCompleted: true },
        'day-02': { completedAt: '2026-10-21', moduleId: 'day-02', completedTasks: [], challengeCompleted: true },
      },
      completedTasks: {
        t1: { completedAt: '2026-10-20', taskId: 't1', moduleId: 'day-01', conceptId: 'c1' },
      },
      lastActiveTimestamp: '2026-10-21T18:00:00Z',
    };

    const mockPrismaState: UserLearningState = {
      ...initialStateForTrack('prisma'),
      completedModules: {
        'prisma-01': { completedAt: '2026-10-22', moduleId: 'prisma-01', completedTasks: [], challengeCompleted: true },
      },
      completedTasks: {
        pt1: { completedAt: '2026-10-22', taskId: 'pt1', moduleId: 'prisma-01', conceptId: 'pc1' },
      },
      lastActiveTimestamp: '2026-10-22T20:00:00Z',
    };

    const summary = getProfileLearningSummary(authUser, {
      sql: mockSqlState,
      prisma: mockPrismaState,
    });

    expect(summary.user.isGuest).toBe(false);
    expect(summary.user.id).toBe('usr_abc123');
    expect(summary.user.name).toBe('Sarah Connor');
    expect(summary.user.initials).toBe('SC');
    expect(summary.user.role).toBe('admin');
    expect(summary.syncStatus.isCloudSynced).toBe(true);

    expect(summary.globalStats.totalDaysCompleted).toBe(3); // 2 SQL + 1 Prisma
    expect(summary.globalStats.totalTasksCompleted).toBe(2); // 1 SQL + 1 Prisma
    expect(summary.globalStats.totalChallengesCompleted).toBe(3);
    expect(summary.globalStats.lastActiveDate).toBe('2026-10-22T20:00:00Z');
  });
});
