import { QueryExecutionResult } from '../../types/database';
import { ValidationRule } from '../../types/curriculum';
import { parseSql } from './parser';
import { splitStatements } from './split-statements';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

export interface ValidationOutcome {
  passed: boolean;
  feedback: string;
  hintLevelToUnlock?: number;
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
      return {
        passed: true,
        feedback: `The query failed as expected. Engine error: ${result.error}`,
      };
    }
    return {
      passed: false,
      feedback: 'This task expects the query to FAIL (e.g. a CHECK or foreign-key violation). Your query succeeded — try inserting a value that breaks a constraint.',
    };
  }

  // Trap checks run on a string-literal-free copy of the SQL so patterns like
  // '%SUM(%' inside quotes can never trigger a false "syntax trap" (P10.1).
  const sqlNoStrings = cleanSql.replace(/'(?:[^']|'')*'/g, "''");

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
    // P10.1: a bare identifier is legitimate when it names a real column or
    // table (e.g. WHERE name = title) — only flag when it could only be an
    // unquoted string. Joins commonly compare two columns, so skip there too.
    const isKnownIdentifier =
      sqlNoStrings.toUpperCase().includes(' JOIN ') ||
      knownIdentifiers.has(rhs.toLowerCase());
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
    const resultCols = result.columns.map(c => c.toLowerCase());
    for (const reqCol of rule.requiredColumns) {
      if (!resultCols.includes(reqCol.toLowerCase())) {
        // Look for possible typo in returned columns
        const typoCandidates = result.columns.filter(c => levenshtein(c.toLowerCase(), reqCol.toLowerCase()) <= 2);
        let typoHint = '';
        if (typoCandidates.length > 0) {
          typoHint = ` Did you mean '${reqCol}' instead of '${typoCandidates[0]}'?`;
        }

        return {
          passed: false,
          feedback: `Missing column '${reqCol}'.${typoHint} Your query currently outputs: [${result.columns.join(', ')}].`,
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

  // 5. Check JOIN requirements
  if (rule.requireJoin && !parsed.joins?.length && !cleanSql.toUpperCase().includes('JOIN')) {
    return {
      passed: false,
      feedback: `This task requires joining multiple tables using the JOIN keyword (e.g. FROM table_a JOIN table_b ON table_a.id = table_b.a_id).`,
    };
  }

  // 6. Check GROUP BY requirements
  if (rule.requireGroupBy && !parsed.groupBy?.length && !cleanSql.toUpperCase().includes('GROUP BY')) {
    return {
      passed: false,
      feedback: `This task requires aggregating rows by categories or entities using the GROUP BY clause.`,
    };
  }

  // 7. Check HAVING requirements
  if (rule.requireHaving && !parsed.havingClause && !cleanSql.toUpperCase().includes('HAVING')) {
    return {
      passed: false,
      feedback: `This task requires filtering aggregated groups using the HAVING clause after GROUP BY.`,
    };
  }

  // 7.5 Check CASE requirement
  if (rule.requireCase && !/\bCASE\b/i.test(cleanSql)) {
    return {
      passed: false,
      feedback: `This task requires a CASE expression (CASE WHEN … THEN … ELSE … END) to produce the requested values.`,
    };
  }

  // 7.6 Check required function (e.g. CONCAT, UPPER, YEAR, DATEDIFF)
  if (rule.requireFunction && !new RegExp(`\\b${rule.requireFunction.toUpperCase()}\\s*\\(`, 'i').test(cleanSql)) {
    return {
      passed: false,
      feedback: `This task requires the ${rule.requireFunction.toUpperCase()}() function in your query.`,
    };
  }

  // 7.7 Check top-level set operation (UNION / UNION ALL / EXCEPT).
  // Scans for the operator OUTSIDE any parentheses so a UNION hidden inside a
  // subquery does not satisfy an EXCEPT requirement (and vice versa).
  if (rule.requireSetOp) {
    let depth = 0;
    let found = false;
    const upper = cleanSql.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (depth === 0) {
        if (upper.startsWith('UNION ALL', i)) { if (rule.requireSetOp === 'UNION ALL') found = true; i += 9; continue; }
        if (upper.startsWith('UNION', i)) { if (rule.requireSetOp === 'UNION') found = true; i += 4; continue; }
        if (upper.startsWith('EXCEPT', i)) { if (rule.requireSetOp === 'EXCEPT') found = true; i += 5; continue; }
      }
    }
    if (!found) {
      return {
        passed: false,
        feedback: `This task requires combining two result sets with a top-level ${rule.requireSetOp} operator (e.g. SELECT … ${rule.requireSetOp} SELECT …).`,
      };
    }
  }

  // 8. Check LIMIT
  if (rule.requireLimit !== undefined) {
    if (typeof rule.requireLimit === 'number') {
      if (effective.limit !== rule.requireLimit) {
        return {
          passed: false,
          feedback: `Almost there! This task specifically requires a LIMIT of ${rule.requireLimit}. Currently LIMIT is ${effective.limit ?? 'not set'}.`,
        };
      }
    } else {
      if (rule.requireLimit.exact && effective.limit !== rule.requireLimit.exact) {
        return {
          passed: false,
          feedback: `This task requires LIMIT ${rule.requireLimit.exact}. Currently LIMIT is ${effective.limit || 'not specified'}.`,
        };
      }
    }
  }

  // 9. Check OFFSET
  if (rule.requireOffset !== undefined) {
    if (effective.offset !== rule.requireOffset) {
      return {
        passed: false,
        feedback: `This task requires an OFFSET of ${rule.requireOffset} (e.g. LIMIT ... OFFSET ${rule.requireOffset}).`,
      };
    }
  }

  // 10. Check ORDER BY
  if (rule.requireOrderBy && rule.requireOrderBy.length > 0) {
    const orderByOk =
      effective.orderBy && effective.orderBy.length > 0
        ? effective.orderBy
        : /\bORDER\s+BY\b/i.test(cleanSql)
          ? rule.requireOrderBy.map((r) => ({ column: r.column, direction: r.direction }))
          : null;
    if (!orderByOk) {
      return {
        passed: false,
        feedback: `Remember to sort the results using the ORDER BY clause.`,
      };
    }
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
    for (const reqOrd of rule.requireOrderBy) {
      const match = (orderByOk as any[]).find(o => resolveSortCol(o.column) === reqOrd.column.toLowerCase());
      if (!match) {
        return {
          passed: false,
          feedback: `Make sure to sort by '${reqOrd.column}'.`,
        };
      }
      if (reqOrd.direction && match.direction !== reqOrd.direction) {
        return {
          passed: false,
          feedback: `Sort direction for '${reqOrd.column}' should be ${reqOrd.direction} (e.g. ORDER BY ${reqOrd.column} ${reqOrd.direction}).`,
        };
      }
    }
  }

  // 11. Check DISTINCT
  if (rule.requireDistinct) {
    if (!parsed.isDistinct && !userSql.toUpperCase().includes('DISTINCT')) {
      return {
        passed: false,
        feedback: `This task requires returning distinct (unique) rows. Use the DISTINCT keyword after SELECT.`,
      };
    }
  }

  // 12. Check WHERE
  if (rule.requireWhere) {
    const hasFilter =
      effective.whereClause ||
      effective.havingClause ||
      /\bWHERE\b/i.test(cleanSql) ||
      /\bHAVING\b/i.test(cleanSql);
    if (!hasFilter) {
      return {
        passed: false,
        feedback: `This task requires filtering with a WHERE clause.`,
      };
    }
    if (rule.whereContainsTerms) {
      // Operator/whitespace-normalized containment: `city <> 'Dhaka'` must
      // satisfy a task phrased with `!=` (same semantics, different spelling).
      const norm = (s: string) => s.toUpperCase().replace(/<>/g, '!=').replace(/\s+/g, ' ').trim();
      const normSql = norm(userSql);
      for (const term of rule.whereContainsTerms) {
        if (!normSql.includes(norm(term))) {
          return {
            passed: false,
            feedback: `Your filter should use '${term}' to check the condition.`,
          };
        }
      }
    }
  }

  // 12.5 P10.3 - Exact-result grading: compare the returned dataset to the
  // solution's output. Values compare per-row as sorted value-multisets, so
  // column identity/order/aliasing never matters; when requireOrderBy is set
  // (a sorting lesson), row ORDER also matters.
  if (rule.requireExactResult && expected && expected.success && !result.error) {
    const gotCols = result.columns.map(c => c.toLowerCase());
    const expCols = expected.columns.map(c => c.toLowerCase());
    if (gotCols.length !== expCols.length) {
      return {
        passed: false,
        feedback: `Your query returned ${gotCols.length} column(s), but the expected result has ${expCols.length}. Check your SELECT list.`,
      };
    }
    const rowKey = (r: any) => Object.values(r || {}).map(serializeValue).sort().join(String.fromCharCode(1));
    const gotKeys = (result.rows || []).map(rowKey);
    const expKeys = (expected.rows || []).map(rowKey);
    const ordered = !!(rule.requireOrderBy && rule.requireOrderBy.length > 0);
    if (ordered) {
      if (gotKeys.length !== expKeys.length || gotKeys.some((k, i) => k !== expKeys[i])) {
        return {
          passed: false,
          feedback: 'The rows you returned do not match the expected result set (values or sort order). Check your filters, JOINs, and ORDER BY.',
        };
      }
    } else if (!sameValueMultiset(gotKeys, expKeys)) {
      return {
        passed: false,
        feedback: 'The returned data does not match the expected result set. The row count was right but one or more values differ - check your filter conditions and JOINs.',
      };
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
    const custom = rule.customValidator(parsed, result);
    if (!custom.valid) {
      return {
        passed: false,
        feedback: custom.message || 'The query result does not match all required criteria.',
      };
    }
  }

  return {
    passed: true,
    feedback: 'Success! Your query produced the expected results and meets all criteria.',
  };
}

