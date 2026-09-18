/**
 * scripts/audit-keyword-case.ts — audit instrument: SQL keyword-CASE fragility.
 *
 * THE BUG CLASS THIS GUARDS
 * SQL keywords are case-insensitive, so every engine regex that matches a
 * keyword must carry the `i` flag. A regex that does not (`/(?:AS\s+)?/`)
 * silently fails to recognise lowercase input and the expression degrades into
 * something else — most often a NULL column, with no error.
 *
 * Caught in production by this class:
 *   SELECT name, 'customer' AS source FROM customers
 *   UNION ALL
 *   SELECT name, 'supplier' as source FROM suppliers;   -- lowercase `as`
 * → the `source` column returned NULL for BOTH operands, because
 *   `parser.ts` matched `'literal' AS alias` with a regex that lacked `/i`, so
 *   the alias was folded into the expression and the literal was lost.
 *   Fixed 2026-09-18; this script exists so it cannot come back.
 *
 * WHAT IT CHECKS
 *   1. REGEX  — regex literals that mention an uppercase SQL keyword but carry
 *               no `i` flag (unless applied to an already-uppercased copy).
 *   2. TEXT   — `.includes/.startsWith/.endsWith('UPPERCASE KEYWORD')` calls on
 *               SQL text (again excluding uppercased receivers).
 *
 * Run: npx tsx scripts/audit-keyword-case.ts   (npm run audit:keyword-case)
 * Exits non-zero when a fragile pattern is found.
 */
import { readFileSync } from 'fs';

const FILES = [
  'src/lib/sql-engine/parser.ts',
  'src/lib/sql-engine/executor.ts',
  'src/lib/sql-engine/validator.ts',
  'src/lib/sql-engine/split-statements.ts',
  'src/lib/sql-engine/state-verification.ts',
];

// Learner-facing SQL-aware modules outside the engine directory: they also
// pattern-match SQL keywords and are held to the same case-folding contract.
const SQL_AWARE_FILES = [
  'src/lib/sql-explain.ts',
  'src/lib/autocomplete.ts',
  'src/lib/highlight-sql.ts',
  'src/lib/format-sql.ts',
  'src/lib/completion-replace.ts',
  'src/lib/editor-errors.ts',
  'src/lib/task-scaffold.ts',
  'src/lib/parse-truth-eval.ts',
];

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
  'ALL', 'DISTINCT', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'OUTER', 'ON',
  'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'TABLE', 'INDEX', 'PRIMARY', 'FOREIGN', 'KEY', 'REFERENCES',
  'DESCRIBE', 'SHOW', 'COLUMNS', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'WITH',
  'EXCEPT', 'INTERSECT', 'ASC', 'DESC', 'BY', 'PARTITION', 'OVER', 'INTERVAL',
];

/**
 * Reviewed exceptions. Each needs a reason — a pattern is only safe when the
 * value it inspects is ALREADY uppercased, so case folding cannot matter.
 * Stale entries (needle no longer present) are reported as findings, so the
 * allowlist cannot quietly rot.
 */
const ALLOWLIST: Array<{ file: string; needle: string; reason: string }> = [
  {
    file: 'parser.ts',
    needle: "rest.startsWith('ALL')",
    reason: '`rest` is sliced from `upperSql` (an uppercased copy) — case is already normalised.',
  },
  {
    file: 'autocomplete.ts',
    needle: 'const re = /\\b(DELETE\\s+FROM|FROM|INSERT\\s+INTO|INTO|JOIN|UPDATE|,)\\s+',
    reason: 'The receiver `masked` is `maskLiterals(...).toUpperCase()` in `referencedTables()` — normalised before matching.',
  },
  {
    file: 'autocomplete.ts',
    needle: 'const seesExpr = /(WHERE|ON|GROUP\\s+BY',
    reason: '`remainder` is sliced from `masked`, which `detectContext()` uppercases before calling `lastKeywordEnd()`.',
  },
  {
    file: 'autocomplete.ts',
    needle: 'const re = /\\b(FROM|JOIN|INSERT\\s+INTO|INTO)\\s+',
    reason: '`masked` is `maskLiterals(beforeCursor).toUpperCase()` in `qualifierTables()` — normalised before matching.',
  },
];

/**
 * Blank out COMMENTS ONLY, preserving line numbers. Quoted strings are left
 * intact on purpose: a regex literal such as /^'([^']*)'\s*(?:AS\s+)?$/ holds
 * quotes inside it, and stripping strings would mangle the very pattern under
 * inspection (that mistake hides this bug class completely).
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  let inBlock = false;
  let inLine = false;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inLine) {
      if (ch === '\n') { inLine = false; out += ch; } else out += ' ';
      i++; continue;
    }
    if (inBlock) {
      if (ch === '*' && next === '/') { inBlock = false; out += '  '; i += 2; continue; }
      out += ch === '\n' ? ch : ' ';
      i++; continue;
    }
    if (ch === '/' && next === '/') { inLine = true; out += '  '; i += 2; continue; }
    if (ch === '/' && next === '*') { inBlock = true; out += '  '; i += 2; continue; }
    out += ch;
    i++;
  }
  return out;
}

/** True when the value under test is an already-uppercased copy. */
function operatesOnUppercased(line: string): boolean {
  return /\.toUpperCase\(\)/.test(line) || /\b(upper|upperSql|cleanSql|masked)\b/.test(line);
}

function allowed(file: string, line: string): boolean {
  return ALLOWLIST.some((a) => file.endsWith(a.file) && line.includes(a.needle));
}

const findings: string[] = [];

const SCANNED = [...FILES, ...SQL_AWARE_FILES];
const contents = new Map<string, string>();
for (const file of SCANNED) contents.set(file, stripComments(readFileSync(file, 'utf8')));

// Stale allowlist entries are findings: a needle that no longer exists means the
// exception was written for code that has since moved or been rewritten.
for (const entry of ALLOWLIST) {
  const file = SCANNED.find((f) => f.endsWith(entry.file));
  if (!file || !contents.get(file)!.includes(entry.needle)) {
    findings.push(
      `STALE  allowlist entry for ${entry.file} no longer matches any code:\n` +
      `         ${entry.needle}\n         Remove or update it (reason was: ${entry.reason})`
    );
  }
}

for (const file of SCANNED) {
  const code = contents.get(file)!;
  code.split(/\r?\n/).forEach((line, idx) => {
    const n = idx + 1;
    if (allowed(file, line)) return;

    // 1. Regex literals that mention an uppercase keyword without the `i` flag.
    const re = /\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^\/\\\n])+\/[gimsuy]*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      const lit = m[0];
      const lastSlash = lit.lastIndexOf('/');
      const body = lit.slice(1, lastSlash);
      const flags = lit.slice(lastSlash + 1);
      if (flags.includes('i')) continue;
      // A regex literal cannot directly follow an identifier, `)`, `]` or a
      // quote — in those positions `/` is division or string content. This
      // rejects e.g. the `/OR/` inside "...supports AND/OR/NOT..." message text.
      const prev = m.index > 0 ? line[m.index - 1] : '';
      if (/[\w$)\]'"`]/.test(prev)) continue;
      const hits = KEYWORDS.filter((k) => new RegExp(`\\b${k}\\b`).test(body));
      if (hits.length === 0 || !/[A-Z]/.test(body)) continue;
      if (operatesOnUppercased(line)) continue;
      findings.push(
        `REGEX  ${file}:${n}  keyword(s) [${hits.slice(0, 4).join(', ')}] but no /i flag\n` +
        `         ${line.trim()}`
      );
    }

    // 2. Uppercase-only text comparisons against SQL keywords.
    const txt = line.match(/\.(includes|startsWith|endsWith|indexOf)\(\s*'[^']*[A-Z]{2,}[^']*'/g);
    if (txt) {
      for (const t of txt) {
        const kw = /'([^']+)'/.exec(t)?.[1] ?? '';
        if (!KEYWORDS.some((k) => kw.includes(k)) || kw !== kw.toUpperCase()) continue;
        if (operatesOnUppercased(line)) continue;
        findings.push(`TEXT   ${file}:${n}  uppercase-only comparison '${kw}'\n         ${line.trim()}`);
      }
    }
  });
}

console.log(`audit-keyword-case: scanned ${SCANNED.length} SQL-aware files, findings=${findings.length}`);
for (const f of findings) console.log('  ' + f);
if (findings.length > 0) {
  console.log(
    '\nA keyword matched case-sensitively will silently mis-parse lowercased SQL.\n' +
    'Add the `i` flag, or test an uppercased copy and add a reasoned ALLOWLIST entry.'
  );
  process.exit(1);
}
console.log('OK — every keyword-matching pattern in the engine is case-insensitive.');