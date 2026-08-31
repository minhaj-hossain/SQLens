/**
 * parse-truth-eval — detects and parses boolean-evaluation content lines that
 * curriculum modules write as plain text, e.g.:
 *
 *   • `TRUE AND TRUE` ---> **TRUE** ✓
 *   1. Rahim: (CSE = TRUE) AND (21 = TRUE) → TRUE ✓
 *   Wireless Mouse ($15.99 > 50.00): FALSE ✕
 *   Rahim: NOT ('Dhaka' = 'Dhaka') → NOT (TRUE) → FALSE ✕
 *
 * The parser is intentionally conservative: prose that merely *mentions*
 * TRUE/FALSE (sentences ending in a period, mid-sentence arrows) never parses,
 * so only genuine evaluation rows become visual cards in the UI.
 */

export type Verdict = 'TRUE' | 'FALSE' | 'UNKNOWN';
export type VerdictMark = '✓' | '✕';

/** A truth-table row: operand OPERATOR operand → verdict. */
export interface TruthRow {
  kind: 'truth';
  left: string;
  op: 'AND' | 'OR' | 'NOT';
  right: string;
  verdict: Verdict;
  mark: VerdictMark | null;
}

/** A subject evaluation row: Subject: expression [→ expression]… → verdict. */
export interface SubjectRow {
  kind: 'row';
  index: number | null;
  subject: string;
  /** Evaluation chain segments, in order (multi-step for NOT chains). */
  chain: string[];
  verdict: Verdict;
  mark: VerdictMark | null;
}

export type EvalRow = TruthRow | SubjectRow;

export interface EvalBlock {
  /** Optional `### N. Heading` label above the rows. */
  label: string | null;
  rows: EvalRow[];
  /** Non-evaluation lines found alongside the rows (rendered as prose). */
  otherLines: string[];
}

const VERDICT_TAIL = /(TRUE|FALSE|UNKNOWN)\s*([✓✕])?\s*$/;
const ARROW_SPLIT = /(?:-{2,}>|→|->)/;
const TRAILING_ARROW = /(?:-{2,}>|→|->)\s*$/;
const TRAILING_SEP = /[-–—:;]\s*$/;
const BULLET_RE = /^[•\-*]\s*/;
const NUMBER_RE = /^(\d+)[.)]\s*/;
const BOOL_WORD = /^(?:TRUE|FALSE|UNKNOWN)$/;

/**
 * Parse a single line into a truth-table row or subject-evaluation row.
 * Returns null when the line is ordinary prose.
 */
export function parseEvalLine(rawLine: string): EvalRow | null {
  let s = rawLine.trim().replace(BULLET_RE, '');

  // Leading "1." / "2)" enumeration — captured as the row index.
  let index: number | null = null;
  const num = s.match(NUMBER_RE);
  if (num) {
    index = parseInt(num[1], 10);
    s = s.slice(num[0].length);
  }

  // Strip markdown emphasis / inline-code markers.
  s = s.replace(/\*\*/g, '').replace(/`/g, '').trim();

  const tail = s.match(VERDICT_TAIL);
  if (!tail || tail.index === undefined || tail.index === 0) return null;
  const verdict = tail[1] as Verdict;
  const mark = (tail[2] as VerdictMark | undefined) ?? null;

  let head = s
    .slice(0, tail.index)
    .replace(TRAILING_ARROW, '')
    .replace(TRAILING_SEP, '')
    .trim();
  if (!head) return null;

  // --- Truth-table row: `TRUE AND TRUE` / `FALSE OR TRUE` / `NOT TRUE` -----
  if (!ARROW_SPLIT.test(head) && !head.includes(':')) {
    const binary = head.match(/^(.{1,40}?)\s+(AND|OR)\s+(.{1,40})$/);
    if (binary && BOOL_WORD.test(binary[1]) && BOOL_WORD.test(binary[3])) {
      return {
        kind: 'truth',
        left: binary[1],
        op: binary[2] as TruthRow['op'],
        right: binary[3],
        verdict,
        mark,
      };
    }
    const unary = head.match(/^NOT\s+(.{1,40})$/);
    if (unary && BOOL_WORD.test(unary[1])) {
      return { kind: 'truth', left: unary[1], op: 'NOT', right: '', verdict, mark };
    }
  }

  // --- Subject evaluation row ----------------------------------------------
  const segments = head
    .split(ARROW_SPLIT)
    .map((seg) => seg.trim())
    .filter(Boolean);
  if (segments.length === 0) return null;

  // "Subject: expression" — subject is the text before the last colon of the
  // first segment (kept short so prose colons can't hijack it).
  const first = segments[0];
  const colonIdx = first.lastIndexOf(':');
  if (colonIdx > 0) {
    const candidate = first.slice(0, colonIdx).trim();
    if (candidate.length > 0 && candidate.length <= 48 && !ARROW_SPLIT.test(candidate)) {
      const expr = first.slice(colonIdx + 1).trim();
      const chain = expr ? [expr, ...segments.slice(1)] : segments.slice(1);
      return { kind: 'row', index, subject: candidate, chain, verdict, mark };
    }
  }

  // "Subject (expression)" — colon form without a colon, e.g.
  // `Wireless Mouse ($15.99 > 50.00): FALSE ✕`.
  const paren = head.match(/^(.{1,48}?)\s*\((.{1,120})\)\s*$/);
  if (paren) {
    return {
      kind: 'row',
      index,
      subject: paren[1].trim(),
      chain: [`(${paren[2]})`],
      verdict,
      mark,
    };
  }

  return null;
}

/** True when the line renders as a visual evaluation row. */
export function isEvalLine(line: string): boolean {
  return parseEvalLine(line) !== null;
}

/**
 * Detect an evaluation block inside an explanation item. Requires at least 2
 * evaluation rows so a stray verdict in prose never gets hijacked. Code fences
 * are skipped entirely (their ✓/✕ characters are code comments).
 */
export function splitEvalBlock(rawText: string): EvalBlock | null {
  if (rawText.includes('```')) return null;
  const lines = rawText.split('\n');

  let label: string | null = null;
  let body = lines;
  if (lines[0] && lines[0].trim().startsWith('### ')) {
    label = lines[0]
      .replace(/^###\s*/, '')
      .replace(/^\d+[.)]\s*/, '')
      .trim();
    body = lines.slice(1);
  }

  const rows: EvalRow[] = [];
  const otherLines: string[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const row = parseEvalLine(trimmed);
    if (row) rows.push(row);
    else otherLines.push(trimmed);
  }

  if (rows.length < 2) return null;
  return { label, rows, otherLines };
}