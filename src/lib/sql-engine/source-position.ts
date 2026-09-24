/**
 * Source positions for engine errors — Milestone-4 audit item P4.17.
 *
 * WHY THIS EXISTS
 * The engine has always named WHAT failed (`Unknown column 'emial' in 'field
 * list'`) but never WHERE. The editor papered over that by regex-searching the
 * learner's SQL for the first whole-word match of the quoted name — which is a
 * guess: it points happily into a `-- comment`, into a string literal, or at
 * the first of several identical names.
 *
 * This module is the engine's own authoritative answer:
 *   - `maskNonTokenText` blanks string literals and comments (length- AND
 *     newline-preserving) so a name that only appears inside text/a comment can
 *     never be located,
 *   - `locateToken` finds every real (code) occurrence with a hand-rolled
 *     whole-word scan — no `\b` surprises on `VARCHR(20)`, and deliberately NO
 *     lookbehind regex (`(?<=…)` throws at construction time on Safari < 16.4,
 *     and this module runs in the browser),
 *   - `extractNamedToken` centralises "which name does this message quote?",
 *     moved down here so the engine and the editor can never disagree about it.
 *
 * HONESTY RULE (same spirit as the governing "never a plausible-looking wrong
 * answer" engine rule): a position is a CLAIM. When the named token occurs more
 * than once in real code we report the FIRST one *plus* the occurrence count,
 * and the UI is expected to drop the "the error is HERE" gutter marker in that
 * case (`errorGutterLine` does exactly that) instead of pointing confidently at
 * a line that may be innocent.
 */

export interface SqlSourcePosition {
  /** 1-based line in the ORIGINAL source (comments and literals included). */
  line: number;
  /** 1-based column in the ORIGINAL source. */
  col: number;
  /** 0-based inclusive offset into the ORIGINAL source. */
  offsetStart: number;
  /** 0-based exclusive offset into the ORIGINAL source. */
  offsetEnd: number;
}

/** A located token plus how often it appears in real (non-comment) code. */
export interface LocatedSqlToken extends SqlSourcePosition {
  occurrences: number;
}

/** Which kind of name an engine message quotes (kept in sync with editor-errors). */
export interface NamedErrorToken {
  token?: string;
  kind: 'table' | 'column' | 'syntax' | 'generic';
  /** True for `Unknown data type 'X'` — the syntax branch words its fix differently. */
  isDataType: boolean;
}

const WORD_CHAR = /[A-Za-z0-9_$]/;

/**
 * Length-preserving mask: every character inside a string literal (`'…'`,
 * `"…"`) or a comment (`-- …`, `# …`, block comment) becomes a space. Newlines
 * are kept so `offsetToLineCol` stays exact on the ORIGINAL source.
 *
 * Backtick identifiers are intentionally NOT masked: `` `emial` `` is real code
 * and must stay locatable. The cost is that a `#`/`--` inside a backtick name
 * would be read as a comment — which can only ever suppress a position, never
 * change what the engine executes.
 */
export function maskNonTokenText(sql: string): string {
  const out = sql.split('');
  const blank = (from: number, to: number) => {
    for (let k = from; k < to && k < out.length; k++) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' ';
    }
  };

  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    const escaped = i > 0 && sql[i - 1] === '\\';

    if ((ch === "'" || ch === '"') && !escaped) {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === '\\') {
          j += 2;
          continue;
        }
        if (sql[j] === ch) {
          // A doubled quote is an escaped quote inside the same literal.
          if (sql[j + 1] === ch) {
            j += 2;
            continue;
          }
          break;
        }
        j++;
      }
      const end = Math.min(j + 1, sql.length);
      blank(i, end);
      i = end;
      continue;
    }

    if ((ch === '-' && next === '-') || ch === '#') {
      const nl = sql.indexOf('\n', i);
      const end = nl < 0 ? sql.length : nl;
      blank(i, end);
      i = end;
      continue;
    }

    if (ch === '/' && next === '*') {
      const close = sql.indexOf('*/', i + 2);
      const end = close < 0 ? sql.length : close + 2;
      blank(i, end);
      i = end;
      continue;
    }

    i++;
  }

  return out.join('');
}

/** 1-based line/column of a 0-based offset in the ORIGINAL source. */
export function offsetToLineCol(sql: string, offset: number): { line: number; col: number } {
  const clamped = Math.max(0, Math.min(offset, sql.length));
  const before = sql.slice(0, clamped);
  const lastNewline = before.lastIndexOf('\n');
  return { line: before.split('\n').length, col: clamped - lastNewline };
}

/**
 * First real (non-comment, non-literal) whole-word occurrence of `token`, plus
 * the total number of such occurrences. Returns null when the name never
 * appears in code — e.g. the learner typed it inside a string literal.
 */
export function locateToken(sql: string, token: string): LocatedSqlToken | null {
  const needle = (token ?? '').trim();
  if (!needle) return null;

  const mask = maskNonTokenText(sql).toLowerCase();
  const hay = needle.toLowerCase();
  const hits: number[] = [];

  let from = 0;
  for (;;) {
    const at = mask.indexOf(hay, from);
    if (at < 0) break;
    const before = at > 0 ? mask[at - 1] : '';
    const after = at + hay.length < mask.length ? mask[at + hay.length] : '';
    if ((before === '' || !WORD_CHAR.test(before)) && (after === '' || !WORD_CHAR.test(after))) {
      hits.push(at);
    }
    from = at + 1;
  }

  if (hits.length === 0) return null;
  const start = hits[0];
  return {
    ...offsetToLineCol(sql, start),
    offsetStart: start,
    offsetEnd: start + needle.length,
    occurrences: hits.length,
  };
}

/**
 * Which name does this engine message quote? Mirrors the priority the editor
 * used before P4.17 (DDL typing → table → column → "near" token) — the
 * difference is that it now lives with the messages being parsed.
 */
export function extractNamedToken(message: string | null | undefined): NamedErrorToken {
  const msg = (message ?? '').trim();
  if (!msg) return { kind: 'generic', isDataType: false };

  const dataTypeMatch = msg.match(/Unknown data type\s+['"`]([^'"`\s]+)['"`]/i);
  const missingTypeMatch = msg.match(/^Column\s+['"`]([^'"`]+)['"`]\s+needs a data type/i);
  if (dataTypeMatch) {
    // 'VARCHR(20)' → 'VARCHR'
    return { token: dataTypeMatch[1].split('(')[0], kind: 'syntax', isDataType: true };
  }
  if (missingTypeMatch) {
    return { token: missingTypeMatch[1], kind: 'generic', isDataType: false };
  }

  const tblMatch =
    msg.match(/Table\s+['"`]([^'"`]+)['"`]/i) || msg.match(/no such table:\s*([A-Za-z0-9_]+)/i);
  if (tblMatch) return { token: tblMatch[1], kind: 'table', isDataType: false };

  const colMatch =
    msg.match(/(?:column|Column)\s+['"`]([^'"`]+)['"`]/i) ||
    msg.match(/Unknown column\s+['"`]?([^'"`\s,]+)['"`]?/i) ||
    msg.match(/no such column:\s*([A-Za-z0-9_.]+)/i);
  if (colMatch) {
    const raw = colMatch[1];
    return {
      token: raw.includes('.') ? raw.split('.').pop() : raw,
      kind: 'column',
      isDataType: false,
    };
  }

  const synMatch =
    msg.match(/near\s+['"`]([^'"`\n]+)['"`]/i) ||
    msg.match(/syntax error near\s+['"`]?([^'"`\s\n]+)['"`]?/i) ||
    msg.match(/unexpected token\s+['"`]?([^'"`\s\n]+)['"`]?/i);
  if (synMatch) return { token: synMatch[1], kind: 'syntax', isDataType: false };

  return { kind: 'generic', isDataType: false };
}

/** Where the named token sits in the learner's source, ignoring comments/literals. */
export function attachErrorPosition(
  message: string | null | undefined,
  sql: string | null | undefined,
): LocatedSqlToken | null {
  if (!sql) return null;
  const { token } = extractNamedToken(message);
  if (!token) return null;
  return locateToken(sql, token);
}

/**
 * Spread-friendly bundle for `QueryExecutionResult` so each executor error exit
 * stays a one-liner. Returns `{}` when nothing could be located — absence is
 * the honest answer, never a fabricated line number.
 */
export function errorPositionFields(
  message: string | null | undefined,
  sql: string | null | undefined,
): { errorPosition?: SqlSourcePosition; errorTokenOccurrences?: number } {
  const found = attachErrorPosition(message, sql);
  if (!found) return {};
  const { occurrences, ...position } = found;
  return { errorPosition: position, errorTokenOccurrences: occurrences };
}

/**
 * Start of the first real statement in a script (skips leading comments and
 * whitespace). Used where the whole statement is unsupported: the engine cannot
 * classify it, so it points at where it begins instead of inventing a token.
 */
export function statementStartPosition(sql: string | null | undefined): SqlSourcePosition | null {
  if (!sql) return null;
  const mask = maskNonTokenText(sql);
  const firstReal = mask.search(/[^\s;]/);
  if (firstReal < 0) return null;
  const word = mask.slice(firstReal).match(/^[A-Za-z_][\w$]*/);
  return {
    ...offsetToLineCol(sql, firstReal),
    offsetStart: firstReal,
    offsetEnd: firstReal + (word ? word[0].length : 1),
  };
}

/**
 * Re-anchor a per-statement position onto the full script. Multi-statement
 * scripts execute statement by statement, so a position computed inside one
 * statement is relative to that statement — reporting it verbatim would point
 * at the wrong line of what the learner actually typed.
 */
export function shiftPosition(
  fullSql: string,
  position: SqlSourcePosition,
  baseOffset: number,
): SqlSourcePosition {
  const offsetStart = position.offsetStart + baseOffset;
  return {
    ...offsetToLineCol(fullSql, offsetStart),
    offsetStart,
    offsetEnd: position.offsetEnd + baseOffset,
  };
}
