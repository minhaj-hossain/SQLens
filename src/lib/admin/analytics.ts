import 'server-only';
import { db } from '@/lib/auth';
import { ALL_MODULES } from '@/content/curriculum-index';
import { ROADMAP_MILESTONES } from '@/config/roadmap';

export interface ModuleAnalyticsItem {
  id: string;
  day: number;
  title: string;
  milestoneId: string;
  completedCount: number;
  completionRate: number; // 0 - 100
  dropoffRate: number;    // % drop relative to previous day
}

export interface MilestoneAnalyticsItem {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  totalModules: number;
  completedCount: number;
  completionRate: number;
}

export interface AdminAnalyticsData {
  totalLearners: number;
  activeLearners7d: number;
  completedCurriculumCount: number;
  medianDayReached: number;
  streakDistribution: {
    streak0to3: number;
    streak4to7: number;
    streak8to14: number;
    streak15plus: number;
  };
  milestones: MilestoneAnalyticsItem[];
  modules: ModuleAnalyticsItem[];
  dropoffCliffs: { moduleId: string; day: number; title: string; dropCount: number }[];
}

/**
 * Aggregates platform-wide learner progress across all 38 modules.
 */
export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const usersCol = db.collection('user');
  const progressCol = db.collection('user_progress');

  // Total learners count
  const totalUsers = await usersCol.countDocuments({ status: { $ne: 'deleted' } });
  const totalLearners = Math.max(totalUsers, 1);

  // Active learners (progress updated in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const activeLearners7d = await progressCol.countDocuments({
    updatedAt: { $gte: sevenDaysAgo },
  });

  // Fetch all progress documents to compute funnel and heatmaps
  const progressDocs = await progressCol.find({}, { projection: { progress: 1 } }).toArray();

  // Count completions per module
  const completionCounts: Record<string, number> = {};
  let streak0to3 = 0;
  let streak4to7 = 0;
  let streak8to14 = 0;
  let streak15plus = 0;
  let completedCurriculumCount = 0;
  const daysReachedList: number[] = [];

  for (const doc of progressDocs) {
    const p = (doc.progress as Record<string, any>) || {};
    const completedMods = (p.completedModules as Record<string, any>) || {};
    const countCompleted = Object.keys(completedMods).length;
    if (countCompleted >= ALL_MODULES.length) {
      completedCurriculumCount++;
    }

    daysReachedList.push(countCompleted);

    for (const [modId, val] of Object.entries(completedMods)) {
      if (val) {
        completionCounts[modId] = (completionCounts[modId] || 0) + 1;
      }
    }

    // Streak stats
    const streak = p.streak?.currentStreak || 0;
    if (streak <= 3) streak0to3++;
    else if (streak <= 7) streak4to7++;
    else if (streak <= 14) streak8to14++;
    else streak15plus++;
  }

  // Median day reached
  daysReachedList.sort((a, b) => a - b);
  const medianDayReached =
    daysReachedList.length > 0
      ? daysReachedList[Math.floor(daysReachedList.length / 2)]
      : 0;

  // Build module stats sorted canonically
  const sortedModules = [...ALL_MODULES].sort(
    (a, b) => (a.day || a.curriculumOrder || 0) - (b.day || b.curriculumOrder || 0),
  );

  let prevCount = totalLearners;
  const moduleItems: ModuleAnalyticsItem[] = [];
  const dropoffCliffs: { moduleId: string; day: number; title: string; dropCount: number }[] = [];

  sortedModules.forEach((mod, idx) => {
    const count = completionCounts[mod.id] || 0;
    const rate = Math.min(100, Math.round((count / totalLearners) * 100));
    const day = mod.day || mod.curriculumOrder || idx + 1;
    
    // Dropoff relative to previous module
    const drop = Math.max(0, prevCount - count);
    const dropPct = prevCount > 0 ? Math.round((drop / prevCount) * 100) : 0;
    
    if (drop > 0 && idx > 0) {
      dropoffCliffs.push({
        moduleId: mod.id,
        day,
        title: mod.title,
        dropCount: drop,
      });
    }

    moduleItems.push({
      id: mod.id,
      day,
      title: mod.title,
      milestoneId: mod.milestoneId || 'milestone-1',
      completedCount: count,
      completionRate: rate,
      dropoffRate: dropPct,
    });

    prevCount = count;
  });

  // Top 3 dropoff cliffs
  dropoffCliffs.sort((a, b) => b.dropCount - a.dropCount);

  // Milestone stats
  const milestoneItems: MilestoneAnalyticsItem[] = ROADMAP_MILESTONES.map((ms) => {
    const modsInMs = ALL_MODULES.filter((m) => ms.moduleIds.includes(m.id));
    const totalMsMods = Math.max(modsInMs.length, 1);
    
    // Total completions across all modules in this milestone
    const totalCompletedInMs = modsInMs.reduce(
      (sum, m) => sum + (completionCounts[m.id] || 0),
      0,
    );
    const avgRate = Math.round((totalCompletedInMs / (totalLearners * totalMsMods)) * 100);

    return {
      id: ms.id,
      number: ms.number,
      title: ms.title,
      subtitle: ms.subtitle,
      totalModules: totalMsMods,
      completedCount: totalCompletedInMs,
      completionRate: Math.min(100, avgRate),
    };
  });

  return {
    totalLearners,
    activeLearners7d,
    completedCurriculumCount,
    medianDayReached,
    streakDistribution: {
      streak0to3,
      streak4to7,
      streak8to14,
      streak15plus,
    },
    milestones: milestoneItems,
    modules: moduleItems,
    dropoffCliffs: dropoffCliffs.slice(0, 4),
  };
}
