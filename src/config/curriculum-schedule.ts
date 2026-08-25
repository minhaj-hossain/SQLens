/**
 * Curriculum Module Publish Schedule
 * ====================================
 * Use this file to manually control when specific modules unlock, regardless
 * of a learner's individual completion timing.
 *
 * ─── FORMAT ─────────────────────────────────────────────────────────────────
 * Map module IDs to ISO 8601 datetime strings. The module will NOT unlock for
 * any user until the real clock passes this timestamp, even if they've
 * completed the prior module and waited the usual 24-hour period.
 *
 * Values here take precedence over any `scheduledPublishDate` field set
 * directly inside a module's content file.
 *
 * ─── USE CASES ───────────────────────────────────────────────────────────────
 *  • Cohort-based launches: release modules on fixed calendar dates.
 *  • Beta gating: hold advanced modules while content is being polished.
 *  • Holiday pauses: prevent unlock during a scheduled course break.
 *
 * ─── EXAMPLES ────────────────────────────────────────────────────────────────
 *  'day-05': '2024-12-01T18:00:00',   // Day 5 unlocks no earlier than Dec 1
 *  'day-10': '2024-12-06T18:00:00',   // Day 10 unlocks no earlier than Dec 6
 *
 * ─── LEAVING EMPTY ───────────────────────────────────────────────────────────
 * An empty map means all modules follow the default 1-day completion gate only.
 */
export const MODULE_PUBLISH_SCHEDULE: Record<string, string> = {
  // Add entries here to restrict specific modules, e.g.:
  // 'day-05': '2024-12-01T18:00:00',
};
