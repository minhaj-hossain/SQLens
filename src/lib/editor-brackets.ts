/**
 * editor-brackets — pure bracket-pair matching + pair highlighting (Batch E1).
 *
 * Extracted from QueryEditor for two reasons:
 *
 *  1. The matcher is a whole-DOCUMENT scan. A multi-row
 *     `INSERT INTO t (a, b)\nVALUES (1, 2),\n       (3, 4);` keeps its opening
 *     `(` on the first row and its closing `)` on the last one, so a matcher
 *     that reasoned about "the caret's line" could never pair them. Only a unit
 *     test can keep that property from regressing.
 *  2. The matcher and the highlight pass used to count parentheses with two
 *     different rules: the matcher walked the raw string, the highlight pass
 *     counted `text-code-punc` spans in the highlighted HTML. A `(` inside a
 *     string literal or a `--` comment counts for one and not the other, so the
 *     counter slid and the glow landed on the wrong characters. Both passes now
 *     share `structuralParens`, defined as "parens the highlighter paints as
 *     punctuation", so they cannot disagree again.
 */

/** A matched pair of parentheses, as character offsets into the source SQL. */
export interface BracketPair {
  /** Offset of the opening `(`. */
  open: number;
  /** Offset of the closing `)`. */
  close: number;
}

/** Classes applied to a matched pair (the pre-E1 inline look, unchanged). */
const PAIR_CLASSES = 'text-func bg-func/25 rounded-xs ring-1 ring-func/60';

const CODE = 0;
const STRING = 1;
const COMMENT = 2;

/**
 * Classify every character as code / `'...'` literal / `--` comment.
 *
 * The rules deliberately mirror `highlightSql`: `'...'` literals (with `\`
 * escapes) are stashed before keywords, and `--` runs to end of line. Block
 * comments are intentionally NOT recognised here because the highlighter does
 * not recognise them either — a mismatch would reintroduce exactly the ordinal
 * drift this module exists to kill.
 */
function classify(sql: string): Uint8Array {
  // Zero-filled = every position starts as CODE.
  const state = new Uint8Array(sql.length);
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === '\\') {
          j += 2;
          continue;
        }
        if (sql[j] === "'") {
          j++;
          break;
        }
        j++;
      }
      state.fill(STRING, i, Math.min(j, sql.length));
      i = j;
      continue;
    }
    if (ch === '-' && sql[i + 1] === '-') {
      let j = i;
      while (j < sql.length && sql[j] !== '\n') j++;
      state.fill(COMMENT, i, j);
      i = j;
      continue;
    }
    i++;
  }
  return state;
}


/**
 * Offsets of every `(`/`)` the highlighter paints as punctuation, in document
 * order. Parens inside a string literal / comment are skipped: the highlighter
 * emits those as one `text-code-str` / `text-code-comment` span, so they never
 * become a punctuation span.
 */
export function structuralParens(sql: string): number[] {
  const state = classify(sql);
  const out: number[] = [];
  for (let i = 0; i < sql.length; i++) {
    if (state[i] === CODE && (sql[i] === '(' || sql[i] === ')')) out.push(i);
  }
  return out;
}

/**
 * The bracket the caret is on: the character AFTER it (how the pair glows while
 * you are typing, the caret having just moved past the bracket) or the
 * character UNDER it (clicking exactly on a bracket). Parens inside a string or
 * comment are not brackets, so they never start a pair.
 */
function bracketAtCaret(
  sql: string,
  caret: number,
  state: Uint8Array,
): { index: number; isOpen: boolean } | null {
  const parenAt = (i: number, ch: '(' | ')'): boolean =>
    i >= 0 && i < sql.length && sql[i] === ch && state[i] === CODE;

  if (parenAt(caret, '(')) return { index: caret, isOpen: true };
  if (parenAt(caret - 1, '(')) return { index: caret - 1, isOpen: true };
  if (parenAt(caret, ')')) return { index: caret, isOpen: false };
  if (parenAt(caret - 1, ')')) return { index: caret - 1, isOpen: false };
  return null;
}

/**
 * The pair enclosing / starting at the caret, or `null` when the caret is not
 * on a bracket (or the bracket is unbalanced).
 *
 * The depth scan walks the WHOLE document — newlines carry no meaning for
 * bracket depth, which is exactly what pairs a multi-row VALUES tuple.
 */
export function findMatchingBracket(sql: string, caret: number): BracketPair | null {
  if (!sql) return null;
  const state = classify(sql);
  const target = bracketAtCaret(sql, caret, state);
  if (!target) return null;

  if (target.isOpen) {
    let depth = 0;
    for (let i = target.index; i < sql.length; i++) {
      if (state[i] !== CODE) continue;
      if (sql[i] === '(') depth++;
      else if (sql[i] === ')' && --depth === 0) return { open: target.index, close: i };
    }
    return null;
  }

  let depth = 0;
  for (let i = target.index; i >= 0; i--) {
    if (state[i] !== CODE) continue;
    if (sql[i] === ')') depth++;
    else if (sql[i] === '(' && --depth === 0) return { open: i, close: target.index };
  }
  return null;
}

/**
 * Glow the two brackets of `pair` inside the highlighted HTML.
 *
 * The Nth punctuation-paren span in the HTML is always the Nth entry of
 * `structuralParens` (same escaping, same stash order), so the pair is
 * addressed by ORDINAL — never by "the Nth paren character in the source",
 * which is what drifted on parens hidden inside string literals or comments.
 * Returns `html` untouched when nothing could be matched, so a stale pair can
 * never inject markup into the overlay.
 */
export function highlightBracketPair(
  html: string,
  sql: string,
  pair: BracketPair | null,
): string {
  if (!html || !pair) return html;
  const parens = structuralParens(sql);
  const openOrdinal = parens.indexOf(pair.open);
  const closeOrdinal = parens.indexOf(pair.close);
  if (openOrdinal < 0 || closeOrdinal < 0) return html;

  let seen = -1;
  let painted = false;
  const out = html.replace(
    /<span class="text-code-punc">([()])<\/span>/g,
    (match: string, ch: string) => {
      seen++;
      if (seen !== openOrdinal && seen !== closeOrdinal) return match;
      painted = true;
      return `<span class="text-code-punc ${PAIR_CLASSES}">${ch}</span>`;
    },
  );
  return painted ? out : html;
}
