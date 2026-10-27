import { getTrackDefinition } from '@/tracks/registry';
import { deriveLastPosition } from '@/lib/progress/unlock-calculator';
import { loadUserState, initialStateForTrack } from '@/lib/progress/storage';
import { trackLearnUrl, trackRoadmapUrl } from '@/lib/track-routes';
import { TRACK_IDS, TRACK_META, TrackId } from '@/types/track';
import { UserLearningState } from '@/types/progress';
import { getAllNetworkingModules } from '@/content/networking';
import type { AuthUser } from '@/components/providers/AuthProvider';

export interface TrackProgressSummary {
  track: TrackId;
  label: string;
  title: string;
  tagline: string;
  basePath: string;
  totalModules: number;
  completedModules: number;
  totalConcepts: number;
  completedConcepts: number;
  totalTasks: number;
  completedTasks: number;
  totalChallenges: number;
  completedChallenges: number;
  percent: number;
  currentDayNumber: number;
  currentDayTitle: string;
  currentMilestoneTitle: string;
  currentMilestoneOrder: number;
  resumeUrl: string;
  roadmapUrl: string;
  lastActiveTimestamp?: string;
  isStarted: boolean;
  isCompleted: boolean;
}

export interface NetworkingProgressSummary {
  track: 'networking';
  label: string;
  title: string;
  tagline: string;
  basePath: string;
  totalModules: number;
  completedModules: number;
  percent: number;
  currentDayNumber: number;
  currentDayTitle: string;
  resumeUrl: string;
  roadmapUrl: string;
  isStarted: boolean;
}

export interface ProfileLearningSummary {
  user: {
    id?: string;
    name: string;
    email: string;
    initials: string;
    role: string;
    isGuest: boolean;
  };
  globalStats: {
    totalDaysCompleted: number;
    totalDaysAvailable: number;
    totalTasksCompleted: number;
    totalChallengesCompleted: number;
    overallPercent: number;
    lastActiveDate: string | null;
  };
  tracks: {
    sql: TrackProgressSummary;
    prisma: TrackProgressSummary;
    networking: NetworkingProgressSummary;
  };
  syncStatus: {
    isCloudSynced: boolean;
    storageKeyPrefix: string;
  };
}

/**
 * Derives user initials for avatar discs.
 * e.g. "Minhaj Hossain" -> "MH", "Alice" -> "A", "alice@example.com" -> "A".
 */
export function getUserInitials(name?: string | null, email?: string | null): string {
  const cleanName = name?.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  const cleanEmail = email?.trim();
  if (cleanEmail) {
    const localPart = cleanEmail.split('@')[0];
    return localPart.charAt(0).toUpperCase();
  }
  return '?';
}

/**
 * Calculates structured progress summary for a single track.
 */
export function getTrackSummary(trackId: TrackId, userState: UserLearningState): TrackProgressSummary {
  const trackDef = getTrackDefinition(trackId);
  const meta = TRACK_META[trackId];
  const modules = trackDef.modules;

  let totalConcepts = 0;
  let totalTasks = 0;
  let totalChallenges = 0;
  let completedChallenges = 0;

  for (const m of modules) {
    totalConcepts += m.concepts.length;
    for (const c of m.concepts) {
      totalTasks += c.tasks.length;
    }
    if (m.challenge) {
      totalChallenges += 1;
      if (userState.completedModules[m.id]?.challengeCompleted) {
        completedChallenges += 1;
      }
    }
  }

  const completedModules = Object.keys(userState.completedModules ?? {}).length;
  const completedConcepts = Object.keys(userState.completedConcepts ?? {}).length;
  const completedTasks = Object.keys(userState.completedTasks ?? {}).length;

  const percent = modules.length > 0
    ? Math.min(100, Math.round((completedModules / modules.length) * 100))
    : 0;

  const position = deriveLastPosition(modules, userState);
  const activeModule = trackDef.getModuleById(position.moduleId) ?? modules[0];

  let resumeUrl = trackRoadmapUrl(trackId);
  if (position.conceptId) {
    resumeUrl = trackLearnUrl(trackId, position.moduleId, 'theory', position.conceptId);
  } else if (activeModule.challenge && !userState.completedModules[activeModule.id]?.challengeCompleted) {
    resumeUrl = trackLearnUrl(trackId, activeModule.id, 'challenge');
  } else {
    resumeUrl = trackLearnUrl(trackId, activeModule.id, 'theory', activeModule.concepts[0]?.id);
  }

  // Determine current milestone
  const currentMilestone = trackDef.milestones.find((ms) => ms.moduleIds.includes(activeModule.id)) ??
    trackDef.milestones[0];

  const isStarted = completedModules > 0 || completedTasks > 0;
  const isCompleted = completedModules >= modules.length && modules.length > 0;

  return {
    track: trackId,
    label: meta.label,
    title: meta.title,
    tagline: meta.tagline,
    basePath: meta.basePath,
    totalModules: modules.length,
    completedModules,
    totalConcepts,
    completedConcepts,
    totalTasks,
    completedTasks,
    totalChallenges,
    completedChallenges,
    percent,
    currentDayNumber: activeModule.day,
    currentDayTitle: activeModule.title,
    currentMilestoneTitle: currentMilestone?.title ?? 'Foundations',
    currentMilestoneOrder: currentMilestone?.number ?? 1,
    resumeUrl,
    roadmapUrl: trackRoadmapUrl(trackId),
    lastActiveTimestamp: userState.lastActiveTimestamp,
    isStarted,
    isCompleted,
  };
}

/**
 * Calculates networking track progress summary.
 */
export function getNetworkingSummary(): NetworkingProgressSummary {
  const modules = getAllNetworkingModules();
  return {
    track: 'networking',
    label: 'Networking',
    title: 'Networking Track — Packet Simulation & Routing',
    tagline: 'Interactive packet & routing simulation on live canvas with a zero-analogy terminal.',
    basePath: '/networking',
    totalModules: modules.length,
    completedModules: 0,
    percent: 0,
    currentDayNumber: 1,
    currentDayTitle: modules[0]?.title ?? 'Direct Link & Physical Layer',
    resumeUrl: '/networking/learn/net-01',
    roadmapUrl: '/networking',
    isStarted: false,
  };
}

/**
 * Reads user state from local storage or memory with fallback for guest accounts.
 */
export function resolveTrackState(trackId: TrackId, userId?: string | null): UserLearningState {
  if (typeof window === 'undefined') {
    return initialStateForTrack(trackId);
  }
  try {
    return loadUserState(userId ?? null, trackId);
  } catch {
    return initialStateForTrack(trackId);
  }
}

/**
 * Aggregates complete profile and cross-track learning summary.
 * Consumed directly by UserProfileView.
 */
export function getProfileLearningSummary(
  authUser: AuthUser | null,
  customStates?: Partial<Record<TrackId, UserLearningState>>
): ProfileLearningSummary {
  const isGuest = !authUser || !authUser.id;
  const userId = authUser?.id ?? null;

  const sqlState = customStates?.sql ?? resolveTrackState('sql', userId);
  const prismaState = customStates?.prisma ?? resolveTrackState('prisma', userId);

  const sqlSummary = getTrackSummary('sql', sqlState);
  const prismaSummary = getTrackSummary('prisma', prismaState);
  const networkingSummary = getNetworkingSummary();

  const totalDaysCompleted = sqlSummary.completedModules + prismaSummary.completedModules + networkingSummary.completedModules;
  const totalDaysAvailable = sqlSummary.totalModules + prismaSummary.totalModules + networkingSummary.totalModules;
  const totalTasksCompleted = sqlSummary.completedTasks + prismaSummary.completedTasks;
  const totalChallengesCompleted = sqlSummary.completedChallenges + prismaSummary.completedChallenges;

  const overallPercent = totalDaysAvailable > 0
    ? Math.min(100, Math.round((totalDaysCompleted / totalDaysAvailable) * 100))
    : 0;

  // Determine latest activity timestamp
  const timestamps = [
    sqlSummary.lastActiveTimestamp,
    prismaSummary.lastActiveTimestamp,
  ].filter(Boolean) as string[];

  timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const lastActiveDate = timestamps[0] || null;

  return {
    user: {
      id: authUser?.id,
      name: authUser?.name || (isGuest ? 'Guest Learner' : 'Learner'),
      email: authUser?.email || (isGuest ? 'Local browser session' : ''),
      initials: getUserInitials(authUser?.name, authUser?.email),
      role: authUser?.role || (isGuest ? 'Guest' : 'Learner'),
      isGuest,
    },
    globalStats: {
      totalDaysCompleted,
      totalDaysAvailable,
      totalTasksCompleted,
      totalChallengesCompleted,
      overallPercent,
      lastActiveDate,
    },
    tracks: {
      sql: sqlSummary,
      prisma: prismaSummary,
      networking: networkingSummary,
    },
    syncStatus: {
      isCloudSynced: !isGuest,
      storageKeyPrefix: isGuest ? 'Guest localStorage' : 'BetterAuth cloud storage',
    },
  };
}
