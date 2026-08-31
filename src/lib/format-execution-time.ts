/**
 * Honest execution-time formatting (tracker item 11).
 * Returns the real value only — never a fabricated fallback number.
 */
export function formatExecutionTime(ms: number | undefined): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  return `${ms.toFixed(1)}ms`;
}