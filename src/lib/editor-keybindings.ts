import { maskLiterals } from './sql-mask';

const PAIRS: Record<string, string> = {
  "'": "'",
  '"': '"',
  '(': ')',
};

export function indentSelection(
  sql: string,
  start: number,
  end: number,
  direction: 'in' | 'out',
): { next: string; start: number; end: number } {
  const lineStart = sql.lastIndexOf('\n', start - 1) + 1;
  const afterEnd = sql.indexOf('\n', end);
  const lineEnd = afterEnd === -1 ? sql.length : afterEnd;
  const block = sql.slice(lineStart, lineEnd);
  const lines = block.split('\n');

  if (direction === 'in') {
    const nextBlock = lines.map((l) => '  ' + l).join('\n');
    const next = sql.slice(0, lineStart) + nextBlock + sql.slice(lineEnd);
    return {
      next,
      start: start + 2,
      end: end + 2 * lines.length,
    };
  }

  let removedBeforeCaret = 0;
  let removedTotal = 0;
  const nextLines = lines.map((l, i) => {
    const drop = l.startsWith('  ') ? 2 : l.startsWith('\t') ? 1 : l.startsWith(' ') ? 1 : 0;
    if (i === 0) removedBeforeCaret = drop;
    removedTotal += drop;
    return l.slice(drop);
  });
  const nextBlock = nextLines.join('\n');
  const next = sql.slice(0, lineStart) + nextBlock + sql.slice(lineEnd);
  return {
    next,
    start: Math.max(lineStart, start - removedBeforeCaret),
    end: Math.max(lineStart, end - removedTotal),
  };
}

export function toggleLineComment(
  sql: string,
  start: number,
  end: number,
): { next: string; start: number; end: number } {
  const lineStart = sql.lastIndexOf('\n', start - 1) + 1;
  const afterEnd = sql.indexOf('\n', Math.max(end - 1, start));
  const lineEnd = afterEnd === -1 ? sql.length : afterEnd;
  const block = sql.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const allCommented = lines.every((l) => /^\s*--/.test(l) || l.trim() === '');
  const nextLines = lines.map((l) => {
    if (!l.trim()) return l;
    if (allCommented) return l.replace(/^(\s*)--\s?/, '$1');
    return l.replace(/^(\s*)/, '$1-- ');
  });
  const nextBlock = nextLines.join('\n');
  const delta = nextBlock.length - block.length;
  const next = sql.slice(0, lineStart) + nextBlock + sql.slice(lineEnd);
  return {
    next,
    start,
    end: Math.max(start, end + delta),
  };
}

export function duplicateLine(
  sql: string,
  start: number,
): { next: string; caret: number } {
  const lineStart = sql.lastIndexOf('\n', start - 1) + 1;
  const after = sql.indexOf('\n', start);
  const lineEnd = after === -1 ? sql.length : after;
  const line = sql.slice(lineStart, lineEnd);
  const next = sql.slice(0, lineEnd) + '\n' + line + sql.slice(lineEnd);
  return { next, caret: start + 1 + line.length };
}

export function moveLine(
  sql: string,
  start: number,
  direction: -1 | 1,
): { next: string; caret: number } {
  const lines = sql.split('\n');
  let offset = 0;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    const len = lines[i].length;
    if (start <= offset + len) {
      idx = i;
      break;
    }
    offset += len + 1;
    idx = i;
  }
  const swap = idx + direction;
  if (swap < 0 || swap >= lines.length) return { next: sql, caret: start };
  const col = start - offset;
  const tmp = lines[idx];
  lines[idx] = lines[swap];
  lines[swap] = tmp;
  const next = lines.join('\n');
  let newOffset = 0;
  for (let i = 0; i < swap; i++) newOffset += lines[i].length + 1;
  return { next, caret: newOffset + Math.min(col, lines[swap].length) };
}

export function selectLineRange(sql: string, start: number): { start: number; end: number } {
  const lineStart = sql.lastIndexOf('\n', start - 1) + 1;
  const after = sql.indexOf('\n', start);
  const lineEnd = after === -1 ? sql.length : after + 1;
  return { start: lineStart, end: lineEnd };
}

export function applyAutoPair(
  sql: string,
  start: number,
  end: number,
  key: string,
): { next: string; caret: number } | null {
  const closer = PAIRS[key];
  if (!closer) return null;
  const selected = sql.slice(start, end);
  if (selected.length > 0) {
    const next = sql.slice(0, start) + key + selected + closer + sql.slice(end);
    return { next, caret: end + 2 };
  }
  const next = sql.slice(0, start) + key + closer + sql.slice(end);
  return { next, caret: start + 1 };
}

export function skipOverCloser(
  sql: string,
  start: number,
  key: string,
): boolean {
  return sql[start] === key && (key === "'" || key === '"' || key === ')');
}

export function deleteEmptyPair(
  sql: string,
  start: number,
): { next: string; caret: number } | null {
  if (start <= 0) return null;
  const open = sql[start - 1];
  const close = PAIRS[open];
  if (!close || sql[start] !== close) return null;
  const next = sql.slice(0, start - 1) + sql.slice(start + 1);
  return { next, caret: start - 1 };
}

/**
 * Argument names + one-line doc per supported function. Batch 5 item 6: the
 * signature bar highlights the argument the caret is currently inside, so this
 * is a table (ordered params) rather than a flat hint string.
 */
export const FUNCTION_SIGNATURE_TABLE: Record<string, { params: string[]; doc: string }> = {
  COUNT: { params: ['column'], doc: 'how many non-NULL values' },
  SUM: { params: ['column'], doc: 'total of numeric values' },
  AVG: { params: ['column'], doc: 'average of numeric values' },
  MIN: { params: ['column'], doc: 'smallest value in the group' },
  MAX: { params: ['column'], doc: 'largest value in the group' },
  CONCAT: { params: ['a', 'b', '…'], doc: 'glue strings together' },
  COALESCE: { params: ['a', 'b', '…'], doc: 'first non-NULL value' },
  SUBSTRING: { params: ['text', 'start', 'length'], doc: 'slice a string' },
  ROUND: { params: ['number', 'decimals'], doc: 'round a number' },
  UPPER: { params: ['text'], doc: 'upper-case the text' },
  LOWER: { params: ['text'], doc: 'lower-case the text' },
  TRIM: { params: ['text'], doc: 'strip surrounding spaces' },
  LENGTH: { params: ['text'], doc: 'count the characters' },
};

export interface FunctionSignature {
  name: string;
  params: string[];
  doc: string;
  /** Zero-based index of the argument the caret currently sits in. */
  activeIndex: number;
}

export interface SignatureParts {
  /** Text before the active argument, e.g. `SUBSTRING(text, `. */
  before: string;
  /** The active argument name to emphasise, e.g. `start`. */
  active: string;
  /** Text after the active argument, e.g. `, length) — slice a string`. */
  after: string;
  /** Full one-line signature, for a `title` / `aria-label`. */
  text: string;
}

/**
 * Signature under the caret (Batch 5, item 6). Scans backwards for the
 * innermost UNCLOSED `(` — nested calls resolve correctly, and `ROUND(SUM(x), `
 * reports ROUND with `decimals` active rather than SUM. The name directly
 * before that paren is looked up in `FUNCTION_SIGNATURE_TABLE`; the argument
 * index is the count of top-level commas between the paren and the caret.
 *
 * Literals are masked first, so `WHERE name = 'COUNT('` never triggers it.
 * Returns `null` when the caret is not inside a known function call.
 */
export function findActiveSignature(textBeforeCursor: string): FunctionSignature | null {
  const masked = maskLiterals(textBeforeCursor);
  let depth = 0;
  let open = -1;
  for (let i = masked.length - 1; i >= 0; i--) {
    const ch = masked[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) {
        open = i;
        break;
      }
      depth--;
    }
  }
  if (open < 0) return null;

  const name = /([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec(masked.slice(0, open))?.[1];
  if (!name) return null;
  const spec = FUNCTION_SIGNATURE_TABLE[name.toUpperCase()];
  if (!spec) return null;

  let nested = 0;
  let separators = 0;
  for (let i = open + 1; i < masked.length; i++) {
    const ch = masked[i];
    if (ch === '(') nested++;
    else if (ch === ')') nested--;
    else if (ch === ',' && nested === 0) separators++;
  }

  return {
    name: name.toUpperCase(),
    params: spec.params,
    doc: spec.doc,
    // More separators than declared params (e.g. a variadic tail) clamps to the
    // last declared argument instead of returning nothing.
    activeIndex: Math.min(separators, spec.params.length - 1),
  };
}

/** Split a signature into the three renderable pieces around the active arg. */
export function signatureParts(sig: FunctionSignature): SignatureParts {
  const { name, params, doc } = sig;
  const i = Math.max(0, Math.min(sig.activeIndex, params.length - 1));
  const before = `${name}(${params.slice(0, i).join(', ')}${i > 0 ? ', ' : ''}`;
  const active = params[i];
  const after = `${i < params.length - 1 ? ', ' : ''}${params.slice(i + 1).join(', ')}) — ${doc}`;
  return { before, active, after, text: `${name}(${params.join(', ')}) — ${doc}` };
}

/**
 * String entry point: the full one-line signature while the caret is inside a
 * known function call, else `null`. Kept for callers that only need the text.
 */
export function signatureHint(textBeforeCursor: string): string | null {
  const sig = findActiveSignature(textBeforeCursor);
  return sig ? signatureParts(sig).text : null;
}
