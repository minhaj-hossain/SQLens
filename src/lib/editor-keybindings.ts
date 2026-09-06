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

export const FUNCTION_SIGNATURES: { test: RegExp; hint: string }[] = [
  { test: /\bCOUNT\s*\(\s*$/i, hint: 'COUNT(column) — how many non-NULL values' },
  { test: /\bSUM\s*\(\s*$/i, hint: 'SUM(column) — total of numeric values' },
  { test: /\bAVG\s*\(\s*$/i, hint: 'AVG(column) — average of numeric values' },
  { test: /\bCONCAT\s*\(\s*$/i, hint: 'CONCAT(a, b, …) — glue strings together' },
  { test: /\bCOALESCE\s*\(\s*$/i, hint: 'COALESCE(a, b, …) — first non-NULL value' },
  { test: /\bSUBSTRING\s*\(\s*$/i, hint: 'SUBSTRING(text, start, length) — slice a string' },
  { test: /\bROUND\s*\(\s*$/i, hint: 'ROUND(number, decimals) — round a number' },
];

export function signatureHint(textBeforeCursor: string): string | null {
  for (const s of FUNCTION_SIGNATURES) {
    if (s.test.test(textBeforeCursor)) return s.hint;
  }
  return null;
}
