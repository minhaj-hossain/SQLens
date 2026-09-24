import { TableSchema } from '../types/database';
import { SQL_KEYWORDS } from './highlight-sql';
// P4-17: the engine owns "which name does this message quote" + "where does it
// sit in real code" (comments and string literals excluded).
import { extractNamedToken, locateToken } from './sql-engine/source-position';
import type { SqlSourcePosition } from './sql-engine/source-position';

/**
 * P4-17: an engine-reported location for the failing token. `occurrences` is
 * how often the token appears in real code — >1 means the engine is telling us
 * "first of several", so the UI must not claim that line is the culprit.
 */
export interface EditorErrorLocation {
  position: SqlSourcePosition;
  occurrences?: number;
}

export interface ParsedEditorError {
  rawMessage: string;
  displayMessage: string;
  token?: string;
  didYouMean?: string;
  line?: number;
  col?: number;
  offsetStart?: number;
  offsetEnd?: number;
  /** How many times `token` appears in real code (engine-reported or located). */
  tokenOccurrences?: number;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function findClosestMatch(
  word: string,
  candidates: string[],
): string | null {
  const clean = word.toLowerCase().trim();
  if (clean.length < 2) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const cand of candidates) {
    const d = levenshtein(clean, cand.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }
  return best && bestDist <= Math.max(2, Math.floor(best.length / 3)) ? best : null;
}

export function parseEditorError(
  rawError: string | null | undefined,
  sql: string,
  schemas: Record<string, TableSchema>,
  /** P4-17: the engine's own position for the failing token, when it has one. */
  location?: EditorErrorLocation | null,
): ParsedEditorError | null {
  if (!rawError || !rawError.trim()) return null;
  const msg = rawError.trim();

  // P0 FIX (blocking INSERT bug): this parser only understands ENGINE errors
  // (e.g. "Table 'custmers' does not exist"). Grading/validation feedback
  // such as "Table 'products' does not match the expected final state ..."
  // must NEVER reach here — it matches the /Table '...' / regex and gets
  // rewritten into the false "does not exist. Did you mean 'products'?"
  // + a no-op "Fix to products" button. Callers must route validation text
  // to ResultsConsole; this guard is defense-in-depth so a future wiring
  // mistake degrades to "no inline bar" instead of a lie.
  // Phase 1 messages KEEP the "does not match the expected final state"
  // prefix (so this guard still fires) and append "Your row count is right,
  // but values differ in ..." — still validation, still ignored here.
  if (
    /does not match the expected final state/i.test(msg) ||
    /your row count is right/i.test(msg) ||
    /values differ in/i.test(msg) ||
    /is missing column\(s\)/i.test(msg) ||
    /has unexpected column\(s\)/i.test(msg) ||
    /does not match the expected/i.test(msg) ||
    /final state could not be verified/i.test(msg) ||
    /reference solution failed/i.test(msg)
  ) {
    return null;
  }

  const allTables = Object.keys(schemas);
  const allColumns = Array.from(
    new Set(Object.values(schemas).flatMap((s) => s.columns.map((c) => c.name))),
  );

  // P4-17: the name-extraction rules moved into the engine
  // (`sql-engine/source-position.ts`), next to the messages they parse, so the
  // editor and the engine cannot drift about which token failed.
  const named = extractNamedToken(msg);
  const token = named.token;
  const kind = named.kind;

  // 4. Where is it? An engine-supplied position is authoritative — it was
  // computed over the raw source with comments and string literals masked. Only
  // when the caller has none do we locate the token ourselves, and if that
  // finds nothing (the name appears only inside a comment or a string literal)
  // we report NO position: a missing marker beats a marker on an innocent line.
  const lineMatch = msg.match(/(?:at|on)?\s*line\s+(\d+)/i);
  let line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  let col: number | undefined;
  let offsetStart: number | undefined;
  let offsetEnd: number | undefined;
  let tokenOccurrences: number | undefined;

  if (location?.position) {
    const p = location.position;
    line = p.line;
    col = p.col;
    offsetStart = p.offsetStart;
    offsetEnd = p.offsetEnd;
    tokenOccurrences = location.occurrences ?? 1;
  }

  if (!location?.position && token && sql) {
    const found = locateToken(sql, token);
    if (found) {
      line = found.line;
      col = found.col;
      offsetStart = found.offsetStart;
      offsetEnd = found.offsetEnd;
      tokenOccurrences = found.occurrences;
    }
  }

  // "Did you mean?" suggestions
  let didYouMean: string | undefined;
  let displayMessage = msg;

  if (kind === 'table' && token) {
    const best = findClosestMatch(token, allTables);
    // P0 FIX: never suggest the token itself ("products" -> "products").
    // findClosestMatch returns distance 0 for an exact (case-insensitive)
    // hit, which used to render a no-op "Fix to products" button next to a
    // false "does not exist" message.
    if (best && best.toLowerCase() !== token.toLowerCase()) {
      didYouMean = best;
      displayMessage = `Table '${token}' does not exist. Did you mean '${best}'?`;
    }
  } else if (kind === 'column' && token) {
    const best = findClosestMatch(token, allColumns);
    if (best && best.toLowerCase() !== token.toLowerCase()) {
      didYouMean = best;
      displayMessage = `No column named '${token}'. Did you mean '${best}'?`;
    }
  } else if (kind === 'syntax' && token) {
    const best = findClosestMatch(token, [...SQL_KEYWORDS]);
    if (best) {
      didYouMean = best;
      displayMessage = named.isDataType
        ? `Unknown data type '${token}'. Did you mean '${best}'?`
        : `Syntax error near '${token}'. Did you mean '${best}'?`;
    }
  }

  return {
    rawMessage: msg,
    displayMessage,
    token,
    didYouMean,
    line,
    col,
    offsetStart,
    offsetEnd,
    tokenOccurrences,
  };
}

/**
 * P4.17 — the gutter line that may carry an error marker, or null.
 *
 * Honesty guard: the engine reports the FIRST real occurrence plus how many
 * there are. When the same name appears more than once, "the error is on this
 * line" would be a guess, so the marker is suppressed (the inline bar still
 * names the line it counted from, and the squiggle still marks the token).
 */
export function errorGutterLine(parsed: ParsedEditorError | null | undefined): number | null {
  if (!parsed?.line) return null;
  if (parsed.tokenOccurrences != null && parsed.tokenOccurrences > 1) return null;
  return parsed.line;
}
