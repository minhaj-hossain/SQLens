import { QueryExecutionResult } from '../../types/database';
import { ValidationRule, ExpectedErrorCategory } from '../../types/curriculum';
import { parseSql, ParsedOrderBy } from './parser';
import { splitStatements } from './split-statements';
import { extractDdlColumns } from './ddl-columns';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

export interface ValidationOutcome {
  passed: boolean;
  feedback: string;
  hintLevelToUnlock?: number;
}

/**
 * Masks every string literal (single- and double-quoted) so textual checks can
 * never be satisfied — or falsely triggered — by text inside a literal.
 * S2-7/S3-8: DIALECT §1 blesses double-quoted strings, so both quote styles
 * must be masked; `SELECT 'CONCAT(' …` must not satisfy `requireFunction:
 * 'CONCAT'`, and `WHERE x LIKE "%SUM(%"` must not fire the aggregate trap.
 */
function maskStringLiterals(sql: string): string {
  let out = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let closed = false;
      while (j < sql.length) {
        if (sql[j] === '\\') { j += 2; continue; }
        if (sql[j] === quote) {
          if (sql[j + 1] === quote) { j += 2; continue; } // SQL escaped quote ('' / "")
          closed = true;
          break;
        }
        j++;
      }
      out += closed ? "''" : sql.slice(i, j);
      i = closed ? j + 1 : j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Removes `-- …`, `# …` line comments and block comments. */
function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n\r]*/g, ' ')
    .replace(/#[^\n\r]*/g, ' ');
}

/**
 * S3-8: the canonical text used by every structural/presence check — string
 * literals and comments removed, so only *real SQL* can satisfy a requirement.
 * Masking runs FIRST so a `#` or `--` inside a literal ('C#', '--') can never
 * be mistaken for the start of a comment.
 */
function structuralSql(sql: string): string {
  return stripSqlComments(maskStringLiterals(sql));
}

/** Escapes regex metacharacters so a column name can be embedded literally. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * S2-5: clause-level features gathered across the WHOLE query shape — the
 * top-level statement, CTE bodies, set-operation operands and EXPLAIN targets.
 * Clause checks used to read only the `effective` parse of one statement, so a
 * CTE-wrapped LIMIT was invisible and the learner got "LIMIT is not set" for a
 * byte-identical result set.
 */
interface QueryFeatureSet {
  joined: boolean;
  groupBy: boolean;
  having: boolean;
  distinct: boolean;
  filterClause: boolean;
  orderBy: ParsedOrderBy[];
  /**
   * Raw text of the ORDER BY clause(s), used to enforce sort DIRECTIONS on
   * shapes `parseOrderByText` cannot fully parse (expressions, multiple
   * clauses). Never used to *satisfy* a requirement on its own — the rule still
   * has to find the required column inside this text.
   */
  orderByText?: string;
  /** Outermost LIMIT wins; a LIMIT found only inside a CTE still counts. */
  limit?: number;
  offset?: number;
  /**
   * Batch 9: every WHERE clause text found ANYWHERE in the query shape
   * (top level, CTE bodies, set-operation operands, derived tables), with string
   * literals blanked so a literal cannot fake a filter.
   *
   * A content validator that inspects `queryAst.whereClause` sees only the
   * top-level statement, so a semantically identical query that moves the filter
   * inside a CTE reported "the filter is missing". Validators should test this
   * list instead — it is nesting-independent.
   */
  whereClauses: string[];
}

function collectQueryFeatures(userSql: string): QueryFeatureSet {
  const masked = maskStringLiterals(userSql);
  const features: QueryFeatureSet = {
    joined: false,
    groupBy: false,
    having: false,
    distinct: false,
    filterClause: false,
    orderBy: [],
    whereClauses: [],
  };
  let limitDepth = Infinity;
  let offsetDepth = Infinity;

  const applyQuery = (q: ReturnType<typeof parseSql>, depth: number, stmtText = '') => {
    if (!q) return;
    if (q.joins?.length) features.joined = true;
    if (q.groupBy?.length) features.groupBy = true;
    if (q.havingClause) features.having = true;
    if (q.isDistinct) features.distinct = true;
    if (q.whereClause) features.filterClause = true;
    // Batch 9: keep every WHERE text (masked) so content validators can inspect
    // the filter regardless of how deeply it is nested.
    if (q.whereClause) features.whereClauses.push(maskStringLiterals(q.whereClause));
    if (q.orderBy?.length) features.orderBy.push(...q.orderBy);
    // Text-level ORDER BY capture (directions for shapes parseOrderByText skips).
    const om = stmtText.match(/\bORDER\s+BY\b([\s\S]*?)(?:\bLIMIT\b|\bOFFSET\b|;|$)/i);
    if (om) {
      const clause = om[1].trim();
      if (clause) features.orderByText = features.orderByText ? `${features.orderByText}, ${clause}` : clause;
    }
    if (typeof q.limit === 'number' && depth < limitDepth) { features.limit = q.limit; limitDepth = depth; }
    if (typeof q.offset === 'number' && depth < offsetDepth) { features.offset = q.offset; offsetDepth = depth; }
  };

  const visit = (fragment: string, depth = 0) => {
    if (depth > 3) return;
    for (const stmt of splitStatements(fragment)) {
      const p = parseSql(stmt);
      applyQuery(p, depth, maskStringLiterals(stmt));
      if (p.type === 'SET_OPERATION') {
        // setLeft/setRight are raw SQL fragments — recurse so each operand's
        // own clauses (LIMIT, ORDER BY, JOINs) contribute to the feature set.
        [p.setLeft, p.setRight].forEach((sq) => sq && visit(sq, depth + 1));
      }
      if (p.type === 'CTE') {
        if (p.cteQuery) visit(p.cteQuery, depth + 1);
        if (p.mainQuery) visit(p.mainQuery, depth + 1);
        (p.ctes ?? []).forEach((c) => visit(c.query, depth + 1));
      }
      if (p.type === 'EXPLAIN' && p.explainTarget) visit(p.explainTarget, depth + 1);
    }
  };
  visit(userSql);

  // Text-level fallbacks for shapes the statement parser cannot split (mixed
  // scripts, chained set ops): still evidence from real SQL, never a
  // self-satisfied pass — directions and columns are parsed, not assumed.
  const upper = masked.toUpperCase();
  if (!features.joined && /\bJOIN\b/.test(upper)) features.joined = true;
  if (!features.groupBy && /\bGROUP\s+BY\b/.test(upper)) features.groupBy = true;
  if (!features.having && /\bHAVING\b/.test(upper)) features.having = true;
  if (!features.distinct && /\bDISTINCT\b/.test(upper)) features.distinct = true;
  if (!features.filterClause && (/\bWHERE\b/.test(upper) || /\bHAVING\b/.test(upper))) features.filterClause = true;
  if (features.orderBy.length === 0) {
    const om = masked.match(/\bORDER\s+BY\b([\s\S]*?)(?:\bLIMIT\b|\bOFFSET\b|;|$)/i);
    if (om) {
      features.orderBy = parseOrderByText(om[1]);
      if (!features.orderByText) features.orderByText = om[1].trim();
    }
  }
  if (features.limit === undefined) {
    const lm = masked.match(/\bLIMIT\s+(\d+)/i);
    if (lm) features.limit = parseInt(lm[1], 10);
  }
  if (features.offset === undefined) {
    const ofm = masked.match(/\bOFFSET\s+(\d+)/i);
    if (ofm) features.offset = parseInt(ofm[1], 10);
  }
  return features;
}

function parseOrderByText(text: string): ParsedOrderBy[] {
  const parts: string[] = [];
  let depth = 0;
  let inQuote: string | null = null;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === "'" || ch === '"' || ch === '`') && (i === 0 || text[i - 1] !== '\\')) {
      if (!inQuote) inQuote = ch;
      else if (inQuote === ch) inQuote = null;
      current += ch;
      continue;
    }
    if (!inQuote) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (ch === ',' && depth === 0) { parts.push(current); current = ''; continue; }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  const out: ParsedOrderBy[] = [];
  for (const part of parts) {
    const m = part.trim().match(/^([`"']?[\w_.]+[`"']?|\d+)\s*(ASC|DESC)?$/i);
    if (!m) continue; // unparsed sort expression — never self-satisfies a rule
    out.push({
      column: m[1].replace(/[`"']/g, ''),
      direction: m[2]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
    });
  }
  return out;
}

/**
 * P10.1 — every column and table name in the seed schema, lowercased. Used by
 * the Quote-Reminder check so valid cross-column comparisons
 * (e.g. WHERE name = title) are never mistaken for unquoted string literals.
 */
const knownIdentifiers: Set<string> = (() => {
  const set = new Set<string>();
  // Common table aliases used across lessons (p, p1/p2, c, o, oi, s, r, cat, ac...) —
  // comparing against an alias is a valid cross-column comparison, not an unquoted string.
  for (const a of ['p','p1','p2','c','o','oi','s','r','cat','ac','b','bo','a','au','pu','pb','e','em','pr','sp','or','od']) set.add(a.toLowerCase());
  for (const [table, schema] of Object.entries(DATABASE_SCHEMAS)) {
    set.add(table.toLowerCase());
    for (const col of schema.columns ?? []) set.add(col.name.toLowerCase());
  }
  return set;
})();

/** Serialize a cell value deterministically for dataset comparison (NULL-safe). */
function serializeValue(v: unknown): string {
  if (v === null || v === undefined) return String.fromCharCode(0) + 'NULL';
  if (typeof v === 'number')
    return 'n:' + (Number.isFinite(v) ? String(Number(v.toPrecision(12))) : String(v));
  if (v instanceof Date) return 'd:' + v.toISOString();
  return 's:' + String(v);
}

/** True when two row-canonical-key lists represent the same multiset (approach-fair). */
function sameValueMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const k of a) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const k of b) {
    const c = counts.get(k);
    if (!c) return false;
    if (c === 1) counts.delete(k); else counts.set(k, c - 1);
  }
  return counts.size === 0;
}

/**
 * S3-12 feedback: name the FIRST row that differs so the learner knows exactly
 * what to fix. Generic "one or more values differ" forces guessing; showing
 * `Row 3 returned ("Dhaka", 1200), expected ("Dhaka", 1020)` points straight at
 * the filter/JOIN/aggregate that is wrong.
 *
 * Rows are matched greedily by canonical key, so the descriptor stays honest for
 * unordered comparisons and never reports a row as "extra" merely because the
 * learner's ORDER BY differs.
 */
function describeRowDifference(gotRows: any[], expRows: any[]): string {
  const keyOf = (r: any) => Object.values(r || {}).map(serializeValue).sort().join(String.fromCharCode(1));
  const display = (r: any) =>
    '(' + Object.values(r || {}).map((v) => (v === null || v === undefined ? 'NULL' : JSON.stringify(v))).join(', ') + ')';

  const used = new Set<number>();
  for (let i = 0; i < gotRows.length; i++) {
    const gk = keyOf(gotRows[i]);
    const match = expRows.findIndex((r, idx) => !used.has(idx) && keyOf(r) === gk);
    if (match === -1) {
      const spare = expRows.findIndex((_r, idx) => !used.has(idx));
      return spare === -1
        ? `Row ${i + 1} ${display(gotRows[i])} is not part of the expected result.`
        : `Row ${i + 1} returned ${display(gotRows[i])} but the expected result has ${display(expRows[spare])}.`;
    }
    used.add(match);
  }

  const missing = expRows.findIndex((_r, idx) => !used.has(idx));
  return missing === -1
    ? ''
    : `The expected result also contains ${display(expRows[missing])}, which your query did not return.`;
}

/**
 * True when a SQL string is a single read-only query (one SELECT / set-op /
 * CTE / EXPLAIN). Only such tasks may use requireExactResult, because
 * computing the expected output must never mutate the session database.
 */
export function isReadOnlySelect(sql: string | undefined): boolean {
  if (!sql) return false;
  const stmts = splitStatements(sql);
  if (stmts.length !== 1) return false;
  const p = parseSql(stmts[0]);
  return p.type === 'SELECT' || p.type === 'SET_OPERATION' || p.type === 'CTE' || (p.type === 'EXPLAIN' && !!p.explainTarget);
}

// Levenshtein distance for fuzzy typo suggestion
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export function validateTaskSolution(
  userSql: string,
  result: QueryExecutionResult,
  rule: ValidationRule,
  expected?: QueryExecutionResult,
  /** P1: index-aligned answers to `rule.judgment` (null/omitted = unanswered). */
  judgmentAnswers?: (number | null)[],
): ValidationOutcome {
  const cleanSql = userSql.trim();

  // Check Trailing Semicolon Hint
  if (!cleanSql.endsWith(';')) {
    // We don't fail just for a missing semicolon, but we can give feedback if something else fails
  }

  // Deliberate-failure lab (transactions Day 25 C3): the task REQUIRES the query
  // to error (e.g. a foreign-key/CHECK violation mid-transaction). Passing means
  // the engine surfaced the failure — the learner then ROLLBACKs to feel atomicity.
  if (rule.expectFailure) {
    if (!result.success) {
      const err = result.error || '';

      // Check table target if rule.targetTable is specified
      if (rule.targetTable) {
        const targetRegex = new RegExp(`\\b${rule.targetTable}\\b`, 'i');
        if (!targetRegex.test(cleanSql)) {
          return {
            passed: false,
            feedback: `Your query does not target the expected table '${rule.targetTable}'. Make sure your statement operates on '${rule.targetTable}'.`,
          };
        }
      }

      // Check if this error is an accidental syntax or parser failure
      const isSyntaxOrEngineFault =
        /syntax error|unexpected token|unrecognized token|cannot parse|unsupported or unparseable|invalid (insert|update|delete|select) syntax|empty (script|query)|table .* does not exist/i.test(
          err,
        );

      // Verify category if specified
      if (rule.expectedErrorCategory) {
        const categoryMap: Record<ExpectedErrorCategory, { regex: RegExp; label: string }> = {
          CHECK_CONSTRAINT: {
            regex: /check constraint violated/i,
            label: 'a CHECK constraint violation',
          },
          FOREIGN_KEY: {
            regex: /foreign key constraint fails/i,
            label: 'a FOREIGN KEY constraint violation',
          },
          NOT_NULL: {
            regex: /not null constraint/i,
            label: 'a NOT NULL constraint violation',
          },
          UNIQUE_CONSTRAINT: {
            regex: /duplicate entry.*for unique/i,
            label: 'a UNIQUE constraint violation',
          },
          TRANSACTION_STATE: {
            regex: /transaction/i,
            label: 'a transaction state error',
          },
        };

        const cat = categoryMap[rule.expectedErrorCategory];
        if (cat) {
          if (!cat.regex.test(err)) {
            return {
              passed: false,
              feedback: `Your query failed with: "${err}", but this lab specifically expects ${cat.label}. Correct any syntax typos or invalid column references and ensure your SQL triggers the required constraint.`,
            };
          }
        }
      }

      // Verify explicit pattern if provided
      if (rule.expectedErrorPattern) {
        const pat =
          typeof rule.expectedErrorPattern === 'string'
            ? new RegExp(rule.expectedErrorPattern, 'i')
            : rule.expectedErrorPattern;
        if (!pat.test(err)) {
          return {
            passed: false,
            feedback: `The query failed with: "${err}", but did not trigger the expected constraint failure (${rule.expectedErrorPattern}). Ensure your SQL targets the required constraint.`,
          };
        }
      }

      // If neither category nor pattern was defined, disallow generic syntax/engine faults
      if (!rule.expectedErrorCategory && !rule.expectedErrorPattern) {
        if (isSyntaxOrEngineFault) {
          return {
            passed: false,
            feedback: `Your query failed with a syntax or table lookup error (${err}), but this lab requires a logical constraint failure (e.g. CHECK or FOREIGN KEY violation). Correct your SQL syntax to test the constraint.`,
          };
        }
        const isRecognizedConstraint =
          /constraint|duplicate entry|foreign key|check|not null/i.test(err);
        if (!isRecognizedConstraint) {
          return {
            passed: false,
            feedback: `Your query failed with "${err}", but did not trigger a recognized constraint failure. Correct your SQL to test the required constraint.`,
          };
        }
      }

      return {
        passed: true,
        feedback: `The query failed as expected. Engine error: ${result.error}`,
      };
    }
    return {
      passed: false,
      feedback:
        'This task expects the query to FAIL (e.g. a CHECK or foreign-key violation). Your query succeeded — try inserting a value that breaks a constraint.',
    };
  }

  // Trap checks run on a string-literal-free copy of the SQL so patterns like
  // '%SUM(%' inside quotes can never trigger a false "syntax trap" (P10.1).
  // S2-7: DIALECT §1 blesses double-quoted strings too, so masking must cover
  // both quote styles — `WHERE name LIKE "%SUM(%"` is a legal pattern, not a trap.
  const sqlNoStrings = maskStringLiterals(cleanSql);

  // Check Common Aggregate in WHERE Trap (only within the WHERE clause and not part of a subquery or HAVING)
  const whereMatch = sqlNoStrings.match(/\bWHERE\b((?:(?!\bSELECT\b)[\s\S])*?)(?:\bGROUP\s+BY\b|\bHAVING\b|\bORDER\s+BY\b|\bLIMIT\b|\)|;|$)/i);
  if (whereMatch && whereMatch[1]) {
    const whereText = whereMatch[1];
    if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(whereText)) {
      return {
        passed: false,
        feedback: `⚠️ Syntax Trap: Aggregate functions like COUNT() or SUM() cannot be used directly in a WHERE clause. Filter aggregates using the HAVING clause after GROUP BY instead.`,
      };
    }
  }

  // Check Missing Quotes around text literals in WHERE (excluding column comparisons like p2.cat_id = p1.cat_id)
  const unquotedMatch = sqlNoStrings.match(/\bWHERE\b\s+([a-zA-Z0-9_.]+)\s*(=|!=|LIKE)\s*([a-zA-Z][a-zA-Z0-9_]*)(?!\s*[\(.])/i);
  if (unquotedMatch) {
    const rhs = unquotedMatch[3].toUpperCase();
    const isKeywordOrNumber = ['NULL', 'TRUE', 'FALSE', 'SELECT', 'AS', 'AND', 'OR', 'NOT'].includes(rhs) || /^\d+$/.test(rhs);
    // Routine parameters (CREATE PROCEDURE/FUNCTION) and local variables are legitimate identifiers in WHERE
    const routineParams = new Set<string>();
    const routineParamMatches = sqlNoStrings.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:PROCEDURE|FUNCTION)\s+[a-zA-Z0-9_.]+\s*\(([\s\S]*?)\)\s*(?:RETURNS\b|BEGIN\b|RETURN\b|AS\b|LANGUAGE\b|DETERMINISTIC\b|$)/gi);
    for (const m of routineParamMatches) {
      const parts = m[1].split(',');
      for (const p of parts) {
        const tokens = p.trim().split(/\s+/);
        if (tokens.length >= 2) {
          const name = ['IN', 'OUT', 'INOUT'].includes(tokens[0].toUpperCase()) ? tokens[1] : tokens[0];
          if (name) routineParams.add(name.toLowerCase());
        }
      }
    }
    const declareMatches = sqlNoStrings.matchAll(/\bDECLARE\s+([a-zA-Z0-9_]+)\b/gi);
    for (const dm of declareMatches) {
      routineParams.add(dm[1].toLowerCase());
    }

    // P10.1: a bare identifier is legitimate when it names a real column or
    // table (e.g. WHERE name = title) — only flag when it could only be an
    // unquoted string. Joins commonly compare two columns, so skip there too.
    const isKnownIdentifier =
      sqlNoStrings.toUpperCase().includes(' JOIN ') ||
      knownIdentifiers.has(rhs.toLowerCase()) ||
      routineParams.has(rhs.toLowerCase());
    if (!isKeywordOrNumber && !isKnownIdentifier) {
      return {
        passed: false,
        feedback: `💡 Quote Reminder: Text values in SQL must be enclosed in single quotes (e.g., '${unquotedMatch[3]}' instead of ${unquotedMatch[3]}).`,
      };
    }
  }

  if (!result.success) {
    return {
      passed: false,
      feedback: `SQL Error: ${result.error}`,
    };
  }

  const parsed = parseSql(userSql);

  // CTE queries carry their real projection / filter / sort clauses inside
  // mainQuery (e.g. `WITH ranked AS (…) SELECT … FROM ranked WHERE … ORDER BY …`).
  // Use that parse for clause-level checks so the rules see the actual query.
  const effective =
    parsed.type === 'CTE' && parsed.mainQuery ? parseSql(parsed.mainQuery) : parsed;

  // ---------------------------------------------------------------------
  // S1-1 decision-first grading scaffolding.
  //
  // Construct rules ("use JOIN", "use LIMIT 3", "use DISTINCT") exist to teach
  // shape, but they used to VETO a dataset that is byte-identical to the
  // reference solution — a learner writing provably-equivalent SQL was told
  // their answer was wrong. Now the dataset verdict is the decision; when it
  // PASSES, unsatisfied construct rules are collected as advisory notes instead
  // of hard failures, unless the task opts into `strictConstruct` (the
  // construct IS the deliverable for that lesson).
  //
  // When the dataset FAILS, the construct note stays the primary message: it is
  // far more actionable ("use DISTINCT after SELECT") than "values differ".
  // ---------------------------------------------------------------------
  const structural = structuralSql(cleanSql);
  const features = collectQueryFeatures(cleanSql);
  const strictConstruct = !!rule.strictConstruct;
  const constructFailures: string[] = [];
  const failConstruct = (message: string) => { constructFailures.push(message); };

  // ---------------------------------------------------------------------
  // S2-5: feature-based presence helpers. `features` unions the top-level
  // statement with CTE bodies, set-operation operands, EXPLAIN targets and
  // every statement of a script, so a construct used anywhere in the query
  // shape satisfies a structural rule (a CTE-wrapped LIMIT is still a LIMIT).
  // ---------------------------------------------------------------------
  const hasJoin = () => features.joined;
  const hasGroupBy = () => features.groupBy;
  const hasHaving = () => features.having;

  /**
   * True when the required set operator appears at paren depth 0 — a UNION
   * hidden inside a subquery must not satisfy an EXCEPT requirement (and vice
   * versa). Runs on `structural` so a literal like 'UNION ALL' cannot fake it.
   * `UNION ALL` deliberately does NOT satisfy a `UNION` requirement.
   */
  const hasTopLevelSetOp = (op: string): boolean => {
    const target = op.toUpperCase();
    const upper = structural.toUpperCase();
    let depth = 0;
    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (depth !== 0) continue;
      if (upper.startsWith('UNION ALL', i)) { if (target === 'UNION ALL') return true; i += 9; continue; }
      if (upper.startsWith('UNION', i)) { if (target === 'UNION') return true; i += 4; continue; }
      if (upper.startsWith('EXCEPT', i)) { if (target === 'EXCEPT') return true; i += 5; continue; }
    }
    return false;
  };

  // 1. Check Target Table
  if (rule.targetTable) {
    let fromTable = parsed.fromTable?.toLowerCase() || parsed.insertTable?.toLowerCase() || parsed.updateTable?.toLowerCase() || parsed.deleteTable?.toLowerCase();
    
    if (parsed.type === 'CTE' && parsed.cteQuery) {
      const cteParsed = parseSql(parsed.cteQuery);
      const mainParsed = parseSql(parsed.mainQuery || '');
      if (
        cteParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() ||
        mainParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() ||
        cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())
      ) {
        fromTable = rule.targetTable.toLowerCase();
      }
    } else if (parsed.type === 'EXPLAIN' && parsed.explainTarget) {
      const expParsed = parseSql(parsed.explainTarget);
      if (expParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase()) {
        fromTable = rule.targetTable.toLowerCase();
      }
    } else if (parsed.type === 'DDL') {
      if (cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())) {
        fromTable = rule.targetTable.toLowerCase();
      }
    }

    // Script / compound-query fallback: multi-statement scripts (BEGIN; INSERT;
    // COMMIT), set operations (SELECT … UNION SELECT …) and chained CTEs hide
    // their tables from the single-statement parse. Check every statement.
    if (!fromTable || fromTable !== rule.targetTable.toLowerCase()) {
      const wanted = rule.targetTable.toLowerCase();
      const tables = new Set<string>();
      const collect = (sqlFragment: string, depth = 0) => {
        if (depth > 3) return;
        for (const stmt of splitStatements(sqlFragment)) {
          const p = parseSql(stmt);
          [p.fromTable, p.insertTable, p.updateTable, p.deleteTable]
            .forEach((t) => t && tables.add(t.toLowerCase()));
          if (p.type === 'SET_OPERATION') {
            [p.setLeft, p.setRight].forEach((sq) => sq && collect(sq, depth + 1));
          }
          if (p.type === 'CTE') {
            if (p.cteQuery) collect(p.cteQuery, depth + 1);
            if (p.mainQuery) collect(p.mainQuery, depth + 1);
            (p.ctes ?? []).forEach((c) => collect(c.query, depth + 1));
          }
        }
      };
      collect(userSql);
      if (tables.has(wanted)) fromTable = wanted;
    }

    if (!fromTable || fromTable !== rule.targetTable.toLowerCase()) {
      return {
        passed: false,
        feedback: `You are querying the table '${fromTable || 'unknown'}', but this task requires querying the '${rule.targetTable}' table. Check your FROM clause.`,
      };
    }
  }

  // 2. Check Required Columns & provide typo suggestions
  if (rule.requiredColumns && rule.requiredColumns.length > 0) {
    // P10.3: with exact-result grading the returned DATASET (column count +
    // values) decides correctness, so column NAMES are free unless aliases are
    // explicitly taught via requiredAliases. This allows aliased / reordered
    // projections (SELECT name AS n, price) instead of false-failing them.
    if (!(rule.requireExactResult && expected?.success)) {
    // DDL contract (Workstream A): CREATE/ALTER statements return no result
    // grid, so the required-column contract is read from the statement itself
    // (`extractDdlColumns`). SELECT/DML keep the result-grid path below.
    const ddlCols = extractDdlColumns(structural);
    const isDdlContract = ddlCols.length > 0;
    const sourceCols = isDdlContract ? ddlCols : result.columns;
    const resultCols = sourceCols.map(c => c.toLowerCase());
    for (const reqCol of rule.requiredColumns) {
      if (!resultCols.includes(reqCol.toLowerCase())) {
        // Look for possible typo in returned/declared columns
        const typoCandidates = sourceCols.filter(c => levenshtein(c.toLowerCase(), reqCol.toLowerCase()) <= 2);
        let typoHint = '';
        if (typoCandidates.length > 0) {
          typoHint = ` Did you mean '${reqCol}' instead of '${typoCandidates[0]}'?`;
        }

        return {
          passed: false,
          feedback: isDdlContract
            ? `Missing column '${reqCol}'.${typoHint} Your statement currently declares: [${ddlCols.join(', ')}].`
            : `Missing column '${reqCol}'.${typoHint} Your query currently outputs: [${result.columns.join(', ')}].`,
        };
      }
    }
    }
  }

  // 3. Check Forbidden Columns (e.g. user ran SELECT * when specific columns were requested)
  if (rule.forbiddenColumns && rule.forbiddenColumns.length > 0) {
    const resultCols = result.columns.map(c => c.toLowerCase());
    for (const forb of rule.forbiddenColumns) {
      if (resultCols.includes(forb.toLowerCase())) {
        return {
          passed: false,
          feedback: `You're querying the correct table, but returning extra columns (found '${forb}'). Explicitly specify only the requested columns in your SELECT clause.`,
        };
      }
    }
  }

  // 4. Check Required Aliases (e.g., AS customer_name)
  if (rule.requiredAliases) {
    for (const [orig, alias] of Object.entries(rule.requiredAliases)) {
      const aliasFound = result.columns.some(c => c.toLowerCase() === alias.toLowerCase());
      if (!aliasFound) {
        return {
          passed: false,
          feedback: `Make sure to alias '${orig}' to '${alias}' using the AS keyword (e.g., SELECT ${orig} AS ${alias}).`,
        };
      }
    }
  }

  // 5. Check JOIN requirements (S2-5: feature set covers CTEs / set ops / scripts)
  if (rule.requireJoin && !hasJoin()) {
    failConstruct(`This task requires joining multiple tables using the JOIN keyword (e.g. FROM table_a JOIN table_b ON table_a.id = table_b.a_id).`);
  }

  // 6. Check GROUP BY requirements
  if (rule.requireGroupBy && !hasGroupBy()) {
    failConstruct(`This task requires aggregating rows by categories or entities using the GROUP BY clause.`);
  }

  // 7. Check HAVING requirements
  if (rule.requireHaving && !hasHaving()) {
    failConstruct(`This task requires filtering aggregated groups using the HAVING clause after GROUP BY.`);
  }

  // 7.5 Check CASE requirement (S3-8: literals/comments masked)
  if (rule.requireCase && !/\bCASE\b/i.test(structural)) {
    failConstruct(`This task requires a CASE expression (CASE WHEN … THEN … ELSE … END) to produce the requested values.`);
  }

  // 7.6 Check required function (e.g. CONCAT, UPPER, YEAR, DATEDIFF)
  if (rule.requireFunction && !new RegExp(`\\b${rule.requireFunction.toUpperCase()}\\s*\\(`, 'i').test(structural)) {
    failConstruct(`This task requires the ${rule.requireFunction.toUpperCase()}() function in your query.`);
  }

  // 7.7 Check top-level set operation (UNION / UNION ALL / EXCEPT).
  // Scans for the operator OUTSIDE any parentheses so a UNION hidden inside a
  // subquery does not satisfy an EXCEPT requirement (and vice versa).
  if (rule.requireSetOp && !hasTopLevelSetOp(rule.requireSetOp)) {
    failConstruct(`This task requires combining two result sets with a top-level ${rule.requireSetOp} operator (e.g. SELECT … ${rule.requireSetOp} SELECT …).`);
  }

  // 7.8 Milestone 4 construct checks
  if (rule.requireView && !/\bVIEW\b/i.test(structural)) {
    failConstruct(`This task requires creating or querying a VIEW (e.g. CREATE VIEW ... AS ...).`);
  }

  if (rule.requireTrigger && !/\bTRIGGER\b/i.test(structural)) {
    failConstruct(`This task requires creating an event trigger (CREATE TRIGGER ...).`);
  }

  if (rule.requireProcedure && !/\b(PROCEDURE|CALL)\b/i.test(structural)) {
    failConstruct(`This task requires creating or invoking a stored procedure (CREATE PROCEDURE or CALL ...).`);
  }

  if (rule.requireCustomFunction && !/\bFUNCTION\b/i.test(structural)) {
    failConstruct(`This task requires creating a stored function (CREATE FUNCTION ...).`);
  }

  if (rule.requireSavepoint && !/\bSAVEPOINT\b/i.test(structural)) {
    failConstruct(`This task requires setting or rolling back to a SAVEPOINT.`);
  }

  if (rule.requireRecursive && !/\bWITH\s+RECURSIVE\b/i.test(structural)) {
    failConstruct(`This task requires a recursive CTE using WITH RECURSIVE.`);
  }

  // 7.9 Idempotent teardown (Workstream D): graded on the statement text —
  // fresh-lifecycle/sandbox tolerance would otherwise mask a missing
  // IF EXISTS behind a lenient re-run.
  if (rule.requireIfExists && !/\bDROP\s+TABLE\s+IF\s+EXISTS\b/i.test(structural)) {
    failConstruct(
      `This teardown must use IF EXISTS so it never errors on a missing table (e.g. DROP TABLE IF EXISTS temp_orders;).`,
    );
  }

  // 8. Check LIMIT (S2-5: the feature set sees CTE / set-op / nested LIMITs)
  if (rule.requireLimit !== undefined) {
    const requiredLimit =
      typeof rule.requireLimit === 'number' ? rule.requireLimit : rule.requireLimit.exact;
    if (requiredLimit !== undefined && features.limit !== requiredLimit) {
      failConstruct(`Almost there! This task specifically requires a LIMIT of ${requiredLimit}. Currently LIMIT is ${features.limit ?? 'not set'}.`);
    }
  }

  // 9. Check OFFSET
  if (rule.requireOffset !== undefined && features.offset !== rule.requireOffset) {
    failConstruct(`This task requires an OFFSET of ${rule.requireOffset} (e.g. LIMIT ... OFFSET ${rule.requireOffset}).`);
  }

  // 10. Check ORDER BY
  if (rule.requireOrderBy && rule.requireOrderBy.length > 0) {
    // S2-5: previously the fallback mapped the REQUIREMENT onto itself, so mere
    // presence of the words "ORDER BY" satisfied both column and direction.
    // Now the requirement must be found in parsed clauses or in the raw
    // ORDER BY text — the requirement never satisfies itself.
    const parsedOrders: ParsedOrderBy[] =
      features.orderBy && features.orderBy.length > 0
        ? features.orderBy
        : features.orderByText
          ? parseOrderByText(features.orderByText)
          : [];
    // P10.5: resolve positional sort keys (ORDER BY 2) to their output column
    // so positional ORDER BY is accepted as the equivalent of naming the column.
    const resolveSortCol = (c: string): string => {
      if (/^\d+$/.test(c)) {
        const idx = parseInt(c, 10) - 1;
        const name = result.columns[idx]?.toLowerCase();
        if (name) return name;
      }
      return c.toLowerCase();
    };
    if (parsedOrders.length === 0) {
      // Unparsed sort expression (e.g. ORDER BY price * -1) — direction cannot
      // be verified, so only the presence of the clause itself can be credited.
      if (!/\bORDER\s+BY\b/i.test(structural)) {
        failConstruct(`Remember to sort the results using the ORDER BY clause.`);
      }
    }
    for (const reqOrd of rule.requireOrderBy) {
      const match = parsedOrders.find(
        (o) => resolveSortCol(o.column) === reqOrd.column.toLowerCase()
      );
      if (!match) {
        // Column-level fallback: the required column may appear inside an
        // unparsed sort expression (ORDER BY LOWER(name) DESC).
        const colRe = new RegExp(`\\b${escapeRegExp(reqOrd.column)}\\b`, 'i');
        if (parsedOrders.length === 0 && colRe.test(features.orderByText ?? '')) {
          if (reqOrd.direction) {
            const dirRe = new RegExp(`\\b${escapeRegExp(reqOrd.column)}\\b[^,]*\\b${reqOrd.direction}\\b`, 'i');
            if (!dirRe.test(features.orderByText ?? '')) {
              failConstruct(`Sort direction for '${reqOrd.column}' should be ${reqOrd.direction} (e.g. ORDER BY ${reqOrd.column} ${reqOrd.direction}).`);
            }
          }
          continue;
        }
        failConstruct(`Make sure to sort by '${reqOrd.column}'.`);
      } else if (reqOrd.direction && match.direction !== reqOrd.direction) {
        failConstruct(`Sort direction for '${reqOrd.column}' should be ${reqOrd.direction} (e.g. ORDER BY ${reqOrd.column} ${reqOrd.direction}).`);
      }
    }
  }

  // 11. Check DISTINCT (S3-8: comments/literals masked, so `-- distinct` no
  // longer satisfies the rule and `'DISTINCT'` in a literal cannot either).
  if (rule.requireDistinct && !features.distinct) {
    failConstruct(`This task requires returning distinct (unique) rows. Use the DISTINCT keyword after SELECT.`);
  }

  // 12. Check WHERE
  if (rule.requireWhere) {
    if (!features.filterClause) {
      failConstruct(`This task requires filtering with a WHERE clause.`);
    }
    if (rule.whereContainsTerms) {
      // Operator/whitespace-normalized containment: `city <> 'Dhaka'` must
      // satisfy a task phrased with `!=` (same semantics, different spelling).
      const norm = (s: string) => s.toUpperCase().replace(/<>/g, '!=').replace(/\s+/g, ' ').trim();
      const normSql = norm(userSql);
      for (const term of rule.whereContainsTerms) {
        if (!normSql.includes(norm(term))) {
          failConstruct(`Your filter should use '${term}' to check the condition.`);
        }
      }
    }
  }

  // 12.5 P10.3 - Exact-result grading: compare the returned dataset to the
  // solution's output. Values compare per-row as sorted value-multisets, so
  // column identity/order/aliasing never matters; when requireOrderBy is set
  // (a sorting lesson), row ORDER also matters.
  //
  // S1-1: this verdict is the DECISION. Unsatisfied construct rules collected
  // above are enforced only for structural-only tasks, or when the task opts
  // into `strictConstruct` — otherwise a correct dataset wins and the construct
  // note is reported as advice (see block 15 at the end of this function).
  let datasetMismatch: string | null = null;
  const datasetGraded = !!(rule.requireExactResult && expected && expected.success && !result.error);
  if (datasetGraded) {
    const gotCols = result.columns.map(c => c.toLowerCase());
    const expCols = expected!.columns.map(c => c.toLowerCase());
    if (gotCols.length !== expCols.length) {
      datasetMismatch = `Your query returned ${gotCols.length} column(s), but the expected result has ${expCols.length}. Check your SELECT list.`;
    } else {
      const rowKey = (r: any) => Object.values(r || {}).map(serializeValue).sort().join(String.fromCharCode(1));
      const gotKeys = (result.rows || []).map(rowKey);
      const expKeys = (expected!.rows || []).map(rowKey);
      const ordered = !!(rule.requireOrderBy && rule.requireOrderBy.length > 0);
      const detail = describeRowDifference(result.rows || [], expected!.rows || []);
      const suffix = detail ? ` ${detail}` : '';
      if (ordered) {
        if (gotKeys.length !== expKeys.length || gotKeys.some((k, i) => k !== expKeys[i])) {
          datasetMismatch =
            `The rows you returned do not match the expected result set (values or sort order).${suffix}`;
        }
      } else if (!sameValueMultiset(gotKeys, expKeys)) {
        datasetMismatch = `The returned data does not match the expected result set.${suffix}`;
      }
    }
  }

  // 13. Check Expected Row Count
  if (rule.expectedRowCount !== undefined) {
    // For DML (INSERT/UPDATE/DELETE) the executor returns a single status row,
    // so rowCount is always 1. The meaningful count is `affectedRows`.
    const countedRows =
      result.affectedRows !== undefined && result.affectedRows !== null
        ? result.affectedRows
        : result.rowCount;

    if (typeof rule.expectedRowCount === 'number') {
      if (countedRows !== rule.expectedRowCount) {
        return {
          passed: false,
          feedback: `Your query returned ${countedRows} row(s), but ${rule.expectedRowCount} row(s) were expected. Check your WHERE condition, JOINs, or LIMIT.`,
        };
      }
    } else {
      if (rule.expectedRowCount.min !== undefined && countedRows < rule.expectedRowCount.min) {
        return {
          passed: false,
          feedback: `Your query returned too few rows (${countedRows}). Check your filtering logic.`,
        };
      }
      if (rule.expectedRowCount.max !== undefined && countedRows > rule.expectedRowCount.max) {
        return {
          passed: false,
          feedback: `Your query returned too many rows (${countedRows}). Check your filtering conditions or LIMIT.`,
        };
      }
    }
  }

  // 14. Custom Validator
  if (rule.customValidator) {
    // Batch 9: pass the nesting-independent feature set as a third argument, so
    // an authored check can see clauses inside CTEs/derived tables instead of
    // only the top-level statement.
    const custom = rule.customValidator(parsed, result, features);
    if (!custom.valid) {
      return {
        passed: false,
        feedback: custom.message || 'The query result does not match all required criteria.',
      };
    }
  }

  // ---------------------------------------------------------------------
  // 15. Final decision (S1-1 decision-first grading — the consumer for the
  // `datasetMismatch` / `constructFailures` collected above).
  //
  // Three regimes:
  //
  //  A. Structural-only task (no comparable dataset: 66 tasks, mostly DML/DDL
  //     where the result IS a mutation). The construct rules ARE the grade, so
  //     every collected construct failure is fatal — exactly as before.
  //
  //  B. Dataset-graded task whose dataset DOES NOT match. The learner's real
  //     problem is the data, but the construct note is far more actionable
  //     ("use DISTINCT after SELECT" beats "one value differs"), so it leads
  //     and the mismatch follows. Either one fails the task.
  //
  //  C. Dataset-graded task whose dataset MATCHES (byte-identical multiset to
  //     the reference solution). The learner has provably produced the right
  //     answer — a construct rule must not veto that. Unsatisfied constructs
  //     are returned as advisory notes in the success feedback, UNLESS the task
  //     sets `strictConstruct` (the construct itself is the deliverable there).
  // ---------------------------------------------------------------------
  // 15. Judgment gate (P1) — reasoning questions attached to the task.
  // Runs ONLY when the SQL verdict would otherwise pass: a broken query must
  // surface its SQL problem first; the reasoning check is the last gate. A
  // missing answer is a failure (the predicate must be reachable and
  // refutable), and a wrong answer fails with the authored explanation.
  const sqlWouldPass = datasetGraded ? !datasetMismatch : constructFailures.length === 0;
  if (
    sqlWouldPass &&
    !(strictConstruct && constructFailures.length > 0) &&
    rule.judgment &&
    rule.judgment.length > 0
  ) {
    for (let ji = 0; ji < rule.judgment.length; ji++) {
      const jq = rule.judgment[ji];
      const given = judgmentAnswers?.[ji];
      if (given === undefined || given === null) {
        return {
          passed: false,
          feedback: `Your query is correct — but answer every reasoning question before submitting. Question ${ji + 1}: "${jq.prompt}"`,
        };
      }
      if (given !== jq.correctIndex) {
        return {
          passed: false,
          feedback: `Question ${ji + 1} is not quite right: "${jq.prompt}" — ${jq.explanation}`,
        };
      }
    }
  }

  if (datasetGraded) {
    if (datasetMismatch) {
      // B: dataset is wrong — fail. Lead with the construct note when present.
      const lead = constructFailures.length > 0 ? `${constructFailures[0]} ` : '';
      return { passed: false, feedback: `${lead}${datasetMismatch}` };
    }
    // C: dataset matches.
    if (constructFailures.length > 0) {
      if (strictConstruct) {
        return { passed: false, feedback: constructFailures[0] };
      }
      const notes = constructFailures.map((n) => `Note: ${n}`).join(' ');
      return {
        passed: true,
        feedback: `Success! Your query produced the expected results. ${notes}`,
      };
    }
    return {
      passed: true,
      feedback: 'Success! Your query produced the expected results and meets all criteria.',
    };
  }

  // A: structural-only grading — any unsatisfied construct rule fails the task.
  if (constructFailures.length > 0) {
    return { passed: false, feedback: constructFailures[0] };
  }

  return {
    passed: true,
    feedback: 'Success! Your query produced the expected results and meets all criteria.',
  };
}

