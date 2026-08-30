/**
 * SQLens Simulated "Today"
 * ─────────────────────────────────────────────────────────────────────────────
 * The SQL engine anchors all date-sensitive functions (CURDATE(), and future
 * date-function work) to this fixed date instead of the real system clock.
 *
 * Why a fixed anchor?
 *  1. Determinism — seed data is static, so temporal exercises must produce
 *     stable results on every run, on every machine, forever.
 *  2. Curriculum alignment — content authors reference this date when writing
 *     "last 60 days" style tasks (e.g. Day 15's `2026-06-25` boundary is
 *     exactly SIMULATED_TODAY − 60 days).
 *  3. Anti-drift — the seed dataset (src/content/database/tables.ts) is dated
 *     2026 (orders span 2026-02-14 → 2026-08-21). The anchor was chosen as
 *     2026-08-24: just after the newest order, so "recent activity" windows
 *     behave sensibly.
 *
 * ⚠️ If you ever change the seed data's date range, update this anchor (and
 * any content that hardcodes a CURDATE()−N boundary) in the same change.
 */
export const SIMULATED_TODAY = '2026-08-24';
