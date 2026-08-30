export interface ParsedSelectColumn {
  raw: string;
  expression: string;
  alias?: string;
  aggregate?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  aggregateArg?: string;
  isDistinct?: boolean;
  /**
   * Literal fallback when the column is `COALESCE(<aggregate>(arg), <literal>)`
   * (e.g. `COALESCE(SUM(oi.quantity), 0)` → fallback `0`). Applied when the
   * aggregate evaluates to NULL (SUM over an all-NULL / empty set).
   */
  coalesceFallback?: string;
  /**
   * Scalar function expression, e.g. `UPPER(name)`, `CONCAT(a, ' ', b)`,
   * `SUBSTRING(name, 1, 3)`, `YEAR(order_date)`, `DATEDIFF(a, b)`.
   * Flat calls only (no nesting) — see docs/DIALECT.md §2.
   */
  functionCall?: { name: string; args: string[] };
  /** Present when the column is a CASE WHEN ... THEN ... ELSE ... END expression. */
  caseExpression?: ParsedCaseWhen;
  windowFunction?: {
    type:
      | 'ROW_NUMBER'
      | 'RANK'
      | 'DENSE_RANK'
      | 'SUM'
      | 'COUNT'
      | 'AVG'
      | 'MIN'
      | 'MAX'
      | 'LAG'
      | 'LEAD';
    partitionBy?: string;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
    /** Column the window operates on (aggregates and LAG/LEAD). */
    aggregateArg?: string;
    /** Raw argument tokens (LAG/LEAD offset/default). */
    args?: string[];
  };
}

export interface ParsedJoin {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';
  table: string;
  alias?: string;
  onLeft: string;
  onRight: string;
}

export interface ParsedCaseWhen {
  whens: Array<{ condition: string; result: string }>;
  elseResult?: string;
}

export interface ParsedOrderBy {
  column: string;
  direction: 'ASC' | 'DESC';
  /** Present when the sort key is a CASE expression (ORDER BY CASE … END). */
  caseExpression?: ParsedCaseWhen;
}

export interface ParsedSqlQuery {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'CTE' | 'EXPLAIN' | 'DDL' | 'SET_OPERATION' | 'UNKNOWN';
  raw: string;
  normalized: string;
  /** Set-operation kind (only for SET_OPERATION queries). */
  setOp?: 'UNION' | 'UNION_ALL' | 'INTERSECT' | 'EXCEPT';
  setLeft?: string;
  setRight?: string;
  isDistinct?: boolean;
  columns?: ParsedSelectColumn[];
  fromTable?: string;
  fromAlias?: string;
  joins?: ParsedJoin[];
  whereClause?: string;
  groupBy?: string[];
  havingClause?: string;
  orderBy?: ParsedOrderBy[];
  limit?: number;
  offset?: number;
  insertTable?: string;
  insertValues?: Record<string, any>;
  /** Multi-row INSERT tuples (`VALUES (...), (...), …`). Always non-empty when the statement had multiple tuples. */
  insertValuesList?: Record<string, any>[];
  updateTable?: string;
  updateSet?: Record<string, any>;
  deleteTable?: string;
  transactionCommand?: 'BEGIN' | 'COMMIT' | 'ROLLBACK';
  cteName?: string;
  cteQuery?: string;
  /** Chained CTE definitions (`WITH a AS (…), b AS (…) SELECT …`). */
  ctes?: { name: string; query: string }[];
  mainQuery?: string;
  explainTarget?: string;
  ddlCommand?: string;
  error?: string;
}

/**
 * Strips comments (-- line comments, # line comments, /* block comments * /)
 * while safely preserving strings.
 */
export function stripComments(rawSql: string): string {
  // 1. Remove block comments /* ... */
  let cleaned = rawSql.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. Remove line comments line by line
  const lines = cleaned.split('\n');
  const nonCommentLines = lines.map((line) => {
    let inQuote: string | null = null;
    let commentStartIdx = -1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Handle quotes
      if ((char === "'" || char === '"' || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
        if (!inQuote) {
          inQuote = char;
        } else if (inQuote === char) {
          inQuote = null;
        }
      } else if (!inQuote) {
        // Check for -- comment or # comment
        if (char === '-' && line[i + 1] === '-') {
          commentStartIdx = i;
          break;
        } else if (char === '#') {
          commentStartIdx = i;
          break;
        }
      }
    }

    if (commentStartIdx !== -1) {
      return line.substring(0, commentStartIdx);
    }
    return line;
  });

  return nonCommentLines.join(' ').replace(/\s+/g, ' ').trim();
}

export function parseSql(rawSql: string): ParsedSqlQuery {
  // Clean comments and normalize whitespace
  const cleanSql = stripComments(rawSql);
  // Strip trailing or leading semicolons
  const sql = cleanSql.replace(/^;+|;+$/g, '').trim();

  if (!sql) {
    return { type: 'UNKNOWN', raw: rawSql, normalized: '', error: 'Empty query' };
  }

  // Transaction keywords
  if (/^BEGIN(\s+TRANSACTION)?/i.test(sql) || /^START\s+TRANSACTION/i.test(sql)) {
    return { type: 'TRANSACTION', raw: rawSql, normalized: sql, transactionCommand: 'BEGIN' };
  }
  if (/^COMMIT/i.test(sql)) {
    return { type: 'TRANSACTION', raw: rawSql, normalized: sql, transactionCommand: 'COMMIT' };
  }
  if (/^ROLLBACK/i.test(sql)) {
    return { type: 'TRANSACTION', raw: rawSql, normalized: sql, transactionCommand: 'ROLLBACK' };
  }

  // CTE (WITH name AS (...) SELECT ...) — supports chained CTEs:
  //   WITH a AS (...), b AS (...) SELECT ...
  if (/^WITH\b/i.test(sql)) {
    const mainIdx = findMainSelectAfterWith(sql);
    const cteSection = sql.slice(4, mainIdx).trim();
    const mainQuery = sql.slice(mainIdx).trim();
    if (mainIdx > 4 && mainQuery && /AS\s*\(/i.test(cteSection)) {
      const ctes: { name: string; query: string }[] = [];
      for (const def of splitFunctionArgs(cteSection)) {
        const m = def.match(/^\s*([a-zA-Z0-9_]+)\s+AS\s*\(([\s\S]+)\)\s*$/i);
        if (m) ctes.push({ name: m[1].trim(), query: m[2].trim() });
      }
      if (ctes.length > 0 && /^SELECT/i.test(mainQuery)) {
        const first = ctes[0];
        return {
          type: 'CTE',
          raw: rawSql,
          normalized: sql,
          cteName: first.name,
          cteQuery: first.query,
          ctes,
          mainQuery,
        };
      }
    }
  }

  // EXPLAIN query
  if (/^EXPLAIN\s+/i.test(sql)) {
    const targetQuery = sql.replace(/^EXPLAIN\s+/i, '').trim();
    return {
      type: 'EXPLAIN',
      raw: rawSql,
      normalized: sql,
      explainTarget: targetQuery,
    };
  }

  // DDL Commands (CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX, DROP INDEX)
  if (/^(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(UNIQUE\s+)?INDEX|DROP\s+INDEX)/i.test(sql)) {
    return {
      type: 'DDL',
      raw: rawSql,
      normalized: sql,
      ddlCommand: sql,
    };
  }

  // Handle SELECT — but first check whether it is a compound (set-operation)
  // query like `SELECT ... UNION [ALL] SELECT ...` / INTERSECT / EXCEPT.
  if (/^SELECT\b/i.test(sql)) {
    const setOps = findAllTopLevelSetOps(sql);
    if (setOps.length > 0) {
      // Split at the LAST top-level operator so chains fold left-associatively:
      // `A UNION B EXCEPT C` must parse as `(A UNION B) EXCEPT C`, matching
      // standard left-to-right evaluation. Splitting at the first operator
      // would right-nest and apply EXCEPT only to the final SELECT.
      const last = setOps[setOps.length - 1];
      return {
        type: 'SET_OPERATION',
        raw: rawSql,
        normalized: sql,
        setOp: (last.op === 'UNION ALL' ? 'UNION_ALL' : last.op) as ParsedSqlQuery['setOp'],
        setLeft: sql.substring(0, last.index).trim(),
        setRight: sql.substring(last.index + last.op.length).trim(),
      };
    }
    return parseSelect(sql, rawSql);
  }

  // Handle INSERT
  if (/^INSERT\s+INTO\b/i.test(sql)) {
    return parseInsert(sql, rawSql);
  }

  // Handle UPDATE
  if (/^UPDATE\b/i.test(sql)) {
    return parseUpdate(sql, rawSql);
  }

  // Handle DELETE
  if (/^DELETE\s+FROM\b/i.test(sql)) {
    return parseDelete(sql, rawSql);
  }

  return { type: 'UNKNOWN', raw: rawSql, normalized: sql, error: 'Unsupported or unparseable SQL statement' };
}

function findTopLevelKeyword(sql: string, keyword: string): number {
  let parenDepth = 0;
  let inQuote: string | null = null;
  const upperSql = sql.toUpperCase();
  const kw = keyword.toUpperCase();

  for (let i = 0; i <= sql.length - kw.length; i++) {
    const char = sql[i];
    if ((char === "'" || char === '"' || char === '`') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inQuote) inQuote = char;
      else if (inQuote === char) inQuote = null;
    } else if (!inQuote) {
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
      else if (parenDepth === 0) {
        const isWordStart = i === 0 || /[\s,;()]/.test(sql[i - 1]);
        const isWordEnd = i + kw.length === sql.length || /[\s,;()]/.test(sql[i + kw.length]);
        if (isWordStart && isWordEnd && upperSql.substring(i, i + kw.length) === kw) {
          return i;
        }
      }
    }
  }
  return -1;
}

interface TopLevelSetOp {
  index: number;
  op: 'UNION ALL' | 'UNION' | 'INTERSECT' | 'EXCEPT';
}

/**
 * Finds every top-level set operator in a SELECT statement, left to right.
 * 'UNION ALL' is matched as a single unit (a bare 'UNION' immediately followed
 * by 'ALL' is not reported as 'UNION'). Used to fold chained set operations
 * left-associatively.
 */
function findAllTopLevelSetOps(sql: string): TopLevelSetOp[] {
  const ops: TopLevelSetOp[] = [];
  let parenDepth = 0;
  let inQuote: string | null = null;
  const upperSql = sql.toUpperCase();

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if ((char === "'" || char === '"' || char === '`') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inQuote) inQuote = char;
      else if (inQuote === char) inQuote = null;
      continue;
    }
    if (inQuote) continue;
    if (char === '(') {
      parenDepth++;
      continue;
    }
    if (char === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (parenDepth !== 0) continue;

    const isWordStart = i === 0 || /[\s,;()]/.test(sql[i - 1]);
    if (!isWordStart) continue;

    for (const op of ['UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT'] as const) {
      const end = i + op.length;
      if (upperSql.substring(i, end) !== op) continue;
      const isWordEnd = end === sql.length || /[\s,;()]/.test(sql[end]);
      if (!isWordEnd) continue;
      // A bare 'UNION' immediately followed by 'ALL' is part of 'UNION ALL'.
      if (op === 'UNION') {
        const rest = upperSql.substring(end).trimStart();
        if (rest.startsWith('ALL') && (rest.length === 3 || /[\s,;()]/.test(rest[3]))) {
          continue;
        }
      }
      ops.push({ index: i, op });
      i = end - 1; // skip past the matched operator
      break;
    }
  }
  return ops;
}

function parseSelect(sql: string, rawSql: string): ParsedSqlQuery {
  const query: ParsedSqlQuery = {
    type: 'SELECT',
    raw: rawSql,
    normalized: sql,
    columns: [],
    joins: [],
    orderBy: [],
    groupBy: [],
  };

  try {
    let remaining = sql;

    // Extract LIMIT & OFFSET from tail (at top level)
    const limitIdx = findTopLevelKeyword(remaining, 'LIMIT');
    if (limitIdx !== -1) {
      const limitSection = remaining.substring(limitIdx).trim();
      const limitMatch = limitSection.match(/^LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?$/i);
      if (limitMatch) {
        query.limit = parseInt(limitMatch[1], 10);
        if (limitMatch[2]) {
          query.offset = parseInt(limitMatch[2], 10);
        }
        remaining = remaining.substring(0, limitIdx).trim();
      }
    }

    // Extract ORDER BY (at top level)
    const orderIdx = findTopLevelKeyword(remaining, 'ORDER BY');
    if (orderIdx !== -1) {
      const orderSection = remaining.substring(orderIdx).replace(/^ORDER\s+BY\s+/i, '').trim();
      const orderExprs = orderSection.split(',').map((s) => s.trim());
      for (const expr of orderExprs) {
        // CASE expression as sort key: ORDER BY CASE WHEN … END [ASC|DESC]
        const caseOrderMatch = expr.match(/^(CASE[\s\S]*END)\s*(ASC|DESC)?$/i);
        if (caseOrderMatch) {
          const parsedCase = parseCaseExpression(caseOrderMatch[1]);
          if (parsedCase) {
            query.orderBy?.push({
              column: '__case_sort__',
              direction: caseOrderMatch[2]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
              caseExpression: parsedCase,
            });
            continue;
          }
        }
        const parts = expr.split(/\s+/);
        const col = parts[0].replace(/[`"']/g, '');
        const dir = parts[1] && parts[1].toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query.orderBy?.push({ column: col, direction: dir });
      }
      remaining = remaining.substring(0, orderIdx).trim();
    }

    // Extract HAVING (at top level)
    const havingIdx = findTopLevelKeyword(remaining, 'HAVING');
    if (havingIdx !== -1) {
      query.havingClause = remaining.substring(havingIdx).replace(/^HAVING\s+/i, '').trim();
      remaining = remaining.substring(0, havingIdx).trim();
    }

    // Extract GROUP BY (at top level)
    const groupIdx = findTopLevelKeyword(remaining, 'GROUP BY');
    if (groupIdx !== -1) {
      const groupSection = remaining.substring(groupIdx).replace(/^GROUP\s+BY\s+/i, '').trim();
      query.groupBy = groupSection.split(',').map((s) => s.trim().replace(/[`"']/g, ''));
      remaining = remaining.substring(0, groupIdx).trim();
    }

    // Extract WHERE (at top level)
    const whereIdx = findTopLevelKeyword(remaining, 'WHERE');
    if (whereIdx !== -1) {
      query.whereClause = remaining.substring(whereIdx).replace(/^WHERE\s+/i, '').trim();
      remaining = remaining.substring(0, whereIdx).trim();
    }

    // Extract FROM & JOINs (at top level)
    const fromIdx = findTopLevelKeyword(remaining, 'FROM');
    if (fromIdx === -1) {
      // FROM-less SELECT (`SELECT 1 AS month`) — constant select list, valid
      // MySQL. Column references resolve to NULL; DISTINCT/* require a table.
      const bareSection = remaining.replace(/^SELECT\s+/i, '').trim();
      if (/^DISTINCT\s+/i.test(bareSection) || bareSection === '*') {
        return { ...query, error: 'DISTINCT and * require a FROM clause' };
      }
      query.columns = parseColumnList(bareSection);
      return query;
    }

    const selectSection = remaining.substring(0, fromIdx).replace(/^SELECT\s+/i, '').trim();
    const fromSection = remaining.substring(fromIdx).replace(/^FROM\s+/i, '').trim();

    // Check DISTINCT
    if (/^DISTINCT\s+/i.test(selectSection)) {
      query.isDistinct = true;
    }
    const cleanSelectSection = selectSection.replace(/^DISTINCT\s+/i, '').trim();

    // Parse Columns
    query.columns = parseColumnList(cleanSelectSection);

    // Parse FROM table and joins
    parseFromAndJoins(fromSection, query);

    return query;
  } catch (err: any) {
    return { ...query, error: err.message || 'Error parsing SQL query' };
  }
}

function parseColumnList(str: string): ParsedSelectColumn[] {
  const cols: ParsedSelectColumn[] = [];
  // Split columns safely respecting commas inside parentheses
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;

    if (char === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }

  for (const part of parts) {
    const cleanPart = part.trim();
    const col: ParsedSelectColumn = {
      raw: cleanPart,
      expression: cleanPart.replace(/^[`"']|[`"']$/g, ''),
    };

    // Quoted string literal (e.g. 'customer' AS source — the tagged
    // UNION ALL pattern): keep the quotes in `expression` so the executor
    // recognizes it as a literal value, not a column reference.
    const strLitMatch = cleanPart.match(/^'([^']*)'\s*(?:AS\s+)?(?:[`"']?([\w_]+)[`"']?)?$/);
    if (strLitMatch) {
      col.expression = `'${strLitMatch[1]}'`;
      col.alias = strLitMatch[2] || strLitMatch[1];
      cols.push(col);
      continue;
    }

    // Check window function:
    //   ROW_NUMBER() / RANK() / DENSE_RANK() ... OVER (PARTITION BY … ORDER BY …)
    //   SUM(col)/COUNT(*)/AVG/MIN/MAX ... OVER (ORDER BY …)        → running/rolling
    //   LAG(col[, offset[, default]]) / LEAD(col[, offset[, default]]) OVER (…)
    const windowMatch = cleanPart.match(
      /^(ROW_NUMBER|RANK|DENSE_RANK|SUM|COUNT|AVG|MIN|MAX|LAG|LEAD)\s*\(([\s\S]*?)\)\s*OVER\s*\(([\s\S]*?)\)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?$/i
    );
    if (windowMatch) {
      const funcType = windowMatch[1].toUpperCase() as any;
      const args = splitFunctionArgs(windowMatch[2]);
      const overBody = windowMatch[3].trim();
      const alias = windowMatch[4]?.replace(/[`"']/g, '').trim() || `${funcType.toLowerCase()}_result`;

      const partMatch = overBody.match(/PARTITION\s+BY\s+([`"']?[\w_.]+[`"']?)/i);
      const orderMatch = overBody.match(/ORDER\s+BY\s+([`"']?[\w_.]+[`"']?)(?:\s+(ASC|DESC))?/i);

      col.expression = alias;
      col.alias = alias;
      col.windowFunction = {
        type: funcType,
        partitionBy: partMatch ? partMatch[1].replace(/[`"']/g, '').trim() : undefined,
        orderBy: orderMatch ? orderMatch[1].replace(/[`"']/g, '').trim() : undefined,
        // SQL default ORDER BY direction is ASC.
        direction: orderMatch && orderMatch[2]?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        aggregateArg: args && args.length > 0 ? args[0].trim().replace(/[`"']/g, '') : undefined,
        args,
      };
      cols.push(col);
      continue;
    }

    // Check aggregate-over-CASE: SUM(CASE WHEN … END) AS alias — must be
    // detected BEFORE the plain CASE branch, which would otherwise swallow
    // the whole expression and drop the aggregate.
    const aggCaseMatch = cleanPart.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(CASE[\s\S]*END)\s*\)(?:\s+AS\s+)?(?:[`"']?([\w_]+)[`"']?)?\s*$/i);
    if (aggCaseMatch) {
      col.aggregate = aggCaseMatch[1].toUpperCase() as any;
      col.aggregateArg = aggCaseMatch[2].trim();
      col.alias = aggCaseMatch[3]?.replace(/[`"']/g, '') || `${col.aggregate.toLowerCase()}_case_result`;
      col.expression = col.alias;
      cols.push(col);
      continue;
    }

    // Check scalar function expressions: UPPER/LOWER/TRIM/LENGTH/CONCAT/
    // SUBSTRING/YEAR/MONTH/DAY/EXTRACT/DATEDIFF — flat calls only.
    const fnMatch = cleanPart.match(/^(UPPER|LOWER|TRIM|LENGTH|CONCAT|SUBSTRING|YEAR|MONTH|DAY|EXTRACT|DATEDIFF)\s*\(([\s\S]*)\)(?:\s+AS\s+)?(?:[`"']?([\w_]+)[`"']?)?\s*$/i);
    if (fnMatch) {
      col.functionCall = { name: fnMatch[1].toUpperCase(), args: splitFunctionArgs(fnMatch[2]) };
      col.alias = fnMatch[3]?.replace(/[`"']/g, '') || `${fnMatch[1].toLowerCase()}_result`;
      col.expression = col.alias;
      cols.push(col);
      continue;
    }

    // Check CASE WHEN ... THEN ... [ELSE ...] END [AS alias] — before the
    // generic alias parsing so embedded string literals aren't mis-parsed.
    if (/\bCASE\b/i.test(cleanPart)) {
      const parsedCase = parseCaseExpression(cleanPart);
      if (parsedCase) {
        const caseAliasMatch = cleanPart.match(/\bEND\s+(?:AS\s+)?([`"']?[\w_]+[`"']?)\s*$/i);
        col.caseExpression = parsedCase;
        col.alias = caseAliasMatch ? caseAliasMatch[1].replace(/[`'"]/g, '') : 'case_result';
        col.expression = col.alias;
        cols.push(col);
        continue;
      }
    }

    // Check alias AS or whitespace
    const asMatch = cleanPart.match(/^([\s\S]+?)\s+(?:AS\s+)?([`"']?[\w_]+[`"']?)$/i);
    if (asMatch && !cleanPart.includes('(')) {
      col.expression = asMatch[1].trim().replace(/[`"']/g, '');
      col.alias = asMatch[2].replace(/[`"']/g, '').trim();
    } else if (asMatch && cleanPart.includes('(') && cleanPart.endsWith(asMatch[2])) {
      col.expression = asMatch[1].trim();
      col.alias = asMatch[2].replace(/[`"']/g, '').trim();
    }

    // Check aggregates
    const aggMatch = col.expression.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]*)\)$/i);
    if (aggMatch) {
      col.aggregate = aggMatch[1].toUpperCase() as any;
      col.aggregateArg = aggMatch[2].trim().replace(/[`"']/g, '');
      if (!col.alias) {
        col.alias = `${col.aggregate.toLowerCase()}_${col.aggregateArg.replace(/[^a-zA-Z0-9_]/g, '')}`;
      }
    } else {
      // COALESCE-wrapped aggregate: COALESCE(SUM(col), 0) — the standard
      // null-safe reporting pattern. Parse the inner aggregate and remember
      // the fallback literal so the executor can substitute it on NULL.
      const coalesceAggMatch = col.expression.match(
        /^COALESCE\s*\(\s*(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([\s\S]*?)\s*\)\s*,\s*([\s\S]+)\)\s*$/i
      );
      if (coalesceAggMatch) {
        col.aggregate = coalesceAggMatch[1].toUpperCase() as any;
        col.aggregateArg = coalesceAggMatch[2].trim().replace(/[`"']/g, '');
        col.coalesceFallback = coalesceAggMatch[3].trim();
        if (!col.alias) {
          col.alias = `coalesce_${col.aggregate.toLowerCase()}_${col.aggregateArg.replace(/[^a-zA-Z0-9_]/g, '')}`;
        }
      }
    }

    // CASE WHEN ... THEN ... is handled above (before alias parsing).
    cols.push(col);
  }

  return cols;
}

function parseFromAndJoins(fromSection: string, query: ParsedSqlQuery) {
  // Support INNER / LEFT [OUTER] / RIGHT [OUTER] / FULL [OUTER] / CROSS / bare JOIN
  const joinParts = fromSection.split(
    /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b/i
  );
  const baseTableExpr = joinParts[0].trim();

  const baseParts = baseTableExpr.split(/\s+(?:AS\s+)?/i);
  query.fromTable = baseParts[0].trim().replace(/[`"']/g, '');
  if (baseParts[1]) {
    query.fromAlias = baseParts[1].trim().replace(/[`"']/g, '');
  }

  for (let i = 1; i < joinParts.length; i += 2) {
    const opToken = (joinParts[i] || '').toUpperCase();
    let joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS' = 'INNER';
    if (/\bRIGHT\b/i.test(opToken)) joinType = 'RIGHT';
    else if (/\bFULL\b/i.test(opToken)) joinType = 'FULL';
    else if (/\bCROSS\b/i.test(opToken)) joinType = 'CROSS';
    else if (/\bLEFT\b/i.test(opToken)) joinType = 'LEFT';

    const joinBody = joinParts[i + 1]?.trim() || '';

    // CROSS JOIN has no ON clause.
    if (joinType === 'CROSS') {
      const crossBody = joinBody.match(/^([`"']?[\w_]+[`"']?)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?/i);
      if (crossBody) {
        query.joins?.push({
          type: 'CROSS',
          table: crossBody[1].replace(/[`"']/g, ''),
          alias: crossBody[2]?.replace(/[`"']/g, ''),
          onLeft: '',
          onRight: '',
        });
      }
      continue;
    }

    const onMatch = joinBody.match(
      /^([`"']?[\w_]+[`"']?)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?\s+(?:ON\s+([\w_.]+)\s*=\s*([\w_.]+))?/i
    );
    if (onMatch) {
      query.joins?.push({
        type: joinType,
        table: onMatch[1].replace(/[`"']/g, ''),
        alias: onMatch[2]?.replace(/[`"']/g, ''),
        onLeft: (onMatch[3] || '').replace(/[`"']/g, ''),
        onRight: (onMatch[4] || '').replace(/[`"']/g, ''),
      });
    }
  }
}

/**
 * Splits the VALUES section of an INSERT into top-level tuples, respecting
 * string literals and nested parentheses: `('A', 1), ('B', 2)` → two tuples.
 */
function splitValueTuples(valueSection: string): string[] {
  const tuples: string[] = [];
  let current = '';
  let depth = 0;
  let inString: string | null = null;
  for (let i = 0; i < valueSection.length; i++) {
    const ch = valueSection[i];
    if (inString) {
      current += ch;
      if (ch === inString && valueSection[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === '(') {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ')') {
      depth--;
      current += ch;
      if (depth === 0) {
        tuples.push(current.trim());
        current = '';
      }
      continue;
    }
    if (ch === ',' && depth === 0) {
      // top-level separator between tuples — discard (drops the ", " gap)
      current = '';
      continue;
    }
    current += ch;
  }
  return tuples.filter((t) => t.length > 2);
}

function parseInsert(sql: string, rawSql: string): ParsedSqlQuery {
  const headerMatch = sql.match(/INSERT\s+INTO\s+([`"']?[\w_]+[`"']?)\s*\(([\s\S]+?)\)\s*VALUES\s*([\s\S]+)$/i);
  if (!headerMatch) {
    return {
      type: 'INSERT',
      raw: rawSql,
      normalized: sql,
      error: 'Invalid INSERT syntax. Expected INSERT INTO table (cols) VALUES (vals)',
    };
  }
  const table = headerMatch[1].replace(/[`"']/g, '');
  const cols = splitFunctionArgs(headerMatch[2])
    .map((s) => s.trim().replace(/[`"']/g, ''))
    .filter(Boolean);

  const tuples = splitValueTuples(headerMatch[3]);
  if (tuples.length === 0) {
    return {
      type: 'INSERT',
      raw: rawSql,
      normalized: sql,
      error: 'Invalid INSERT syntax. Expected at least one VALUES tuple.',
    };
  }

  const rowFromVals = (vals: string[]): Record<string, any> => {
    const row: Record<string, any> = {};
    cols.forEach((col, idx) => {
      const rawVal = (vals[idx] ?? '').trim().replace(/^['"]|['"]$/g, '');
      const num = Number(rawVal);
      row[col] = !isNaN(num) && rawVal !== '' ? num : rawVal;
    });
    return row;
  };

  const insertValuesList = tuples.map((t) =>
    rowFromVals(splitFunctionArgs(t.trim().replace(/^\(/, '').replace(/\)$/, '')))
  );

  return {
    type: 'INSERT',
    raw: rawSql,
    normalized: sql,
    insertTable: table,
    insertValues: insertValuesList[0],
    insertValuesList,
  };
}

function parseUpdate(sql: string, rawSql: string): ParsedSqlQuery {
  const match = sql.match(/UPDATE\s+([`"']?[\w_]+[`"']?)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
  if (!match) {
    return { type: 'UPDATE', raw: rawSql, normalized: sql, error: 'Invalid UPDATE syntax' };
  }
  const table = match[1].replace(/[`"']/g, '');
  const setExpr = match[2];
  const whereClause = match[3]?.trim();

  // Store each SET value RAW (quotes preserved). executeUpdate's
  // evaluateSetValue owns interpretation: quoted strings unquote, numeric
  // literals convert, expressions compute against the current row. The old
  // behavior transformed values here - which stripped the quotes from string
  // literals, so evaluateSetValue no longer recognized them and corrupted
  // prose values into booleans downstream.
  const updateSet: Record<string, any> = {};
  for (const pair of splitFunctionArgs(setExpr)) {
    const eqIdx = findTopLevelEquals(pair);
    if (eqIdx === -1) continue;
    const col = pair.slice(0, eqIdx).trim().replace(/[`"']/g, '');
    const val = pair.slice(eqIdx + 1).trim();
    if (col && val !== '') updateSet[col] = val;
  }

  return {
    type: 'UPDATE',
    raw: rawSql,
    normalized: sql,
    updateTable: table,
    updateSet,
    whereClause,
  };
}

function parseDelete(sql: string, rawSql: string): ParsedSqlQuery {
  const match = sql.match(/DELETE\s+FROM\s+([`"']?[\w_]+[`"']?)(?:\s+WHERE\s+([\s\S]+))?$/i);
  if (!match) {
    return { type: 'DELETE', raw: rawSql, normalized: sql, error: 'Invalid DELETE syntax' };
  }
  return {
    type: 'DELETE',
    raw: rawSql,
    normalized: sql,
    deleteTable: match[1].replace(/[`"']/g, ''),
    whereClause: match[2]?.trim(),
  };
}

/**
 * Parses a `CASE WHEN <cond> THEN <result> ... [ELSE <result>] END`
 * expression into its condition/result parts. Quote-aware so string literals
 * inside conditions or results are preserved.
 */
export function parseCaseExpression(input: string): ParsedCaseWhen | null {
  // Strip a trailing alias if present ("... END AS bucket" / "... END bucket").
  let src = input.replace(/\bEND\s+(?:AS\s+)?[`"']?[\w_]+[`"']?\s*$/i, 'END');
  const caseMatch = src.match(/\bCASE\b([\s\S]*?)\bEND\b/i);
  if (!caseMatch) return null;
  const body = caseMatch[1];

  // Optional simple CASE operand: CASE <expr> WHEN a THEN ...
  // A leading operand is ignored for evaluation; handle searched CASE only for
  // correctness, but allow the bar to fall back if operative part is missing.
  const whens: Array<{ condition: string; result: string }> = [];
  let elseResult: string | undefined;

  // Split by WHEN at top-level (quote & paren aware).
  const rawClauses = splitCaseClauses(body);
  for (const clause of rawClauses) {
    const t = clause.trim();
    if (/^WHEN\b/i.test(t)) {
      const whenMatch = t.match(/^WHEN\b([\s\S]*?)\bTHEN\b([\s\S]*)$/i);
      if (whenMatch) {
        whens.push({
          condition: whenMatch[1].trim(),
          result: whenMatch[2].trim(),
        });
      }
    } else if (/^ELSE\b/i.test(t)) {
      const elseMatch = t.match(/^ELSE\b([\s\S]*)$/i);
      if (elseMatch) elseResult = elseMatch[1].trim();
    }
  }

  if (whens.length === 0) return null;
  return { whens, elseResult };
}

/**
 * Finds the index of the main `SELECT` that starts a `WITH ... AS (...) SELECT`
 * statement. The earliest candidate is at paren-depth 0 AFTER at least one CTE
 * body has been opened and closed — bodies may themselves contain SELECT
 * keywords, but only ever at depth ≥ 1.
 */
function findMainSelectAfterWith(sql: string): number {
  let depth = 0;
  let opened = false;
  for (let i = 4; i < sql.length - 6; i++) {
    const ch = sql[i];
    if (ch === '(') { depth++; opened = true; }
    else if (ch === ')') { depth--; }
    if (depth === 0 && opened && /\bSELECT\b/i.test(sql.slice(i, i + 7))) {
      return i;
    }
  }
  return -1;
}

/**
 * Splits a function-call argument list on top-level commas (paren- and
 * quote-aware): `name, ' <', email` → [`name`, `' <'`, `email`].
 */
/** Finds the first `=` outside quotes/parens in a SET pair. -1 when absent. */
function findTopLevelEquals(s: string): number {
  let inString: string | null = null;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inString = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === '=' && depth === 0) return i;
  }
  return -1;
}

export function splitFunctionArgs(argList: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;
  let inString: string | null = null;
  for (let i = 0; i < argList.length; i++) {
    const ch = argList[i];
    if (inString) {
      current += ch;
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

/** Splits a CASE body on WHEN/ELSE keywords at depth 0 (quote-aware). */
function splitCaseClauses(body: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString: string | null = null;

  const tokens = [/\bWHEN\b/.source, /\bELSE\b/.source, /\bEND\b/.source].join('|');
  const splitter = new RegExp(`(${tokens})`, 'i');

  let rest = body;
  while (rest.length) {
    const m = splitter.exec(rest);
    const head = m ? rest.slice(0, m.index) : rest;
    if (head.trim()) parts.push(head);
    if (!m) break;
    const seg = m[0];
    // Rebuild node: WHEN takes the value up to the chunk; push operator separately.
    // Simpler: push each keyword token as its own fragment start.
    parts.push(seg);
    rest = rest.slice(m.index + seg.length);
  }

  // Rejoin fragments: a fragment starting with WHEN/ELSE previously owns the text
  // that came BEFORE it. Assemble so that each WHEN/ELSE carries its predicate.
  const rebuilt: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (/^(WHEN|ELSE|THEN)\b/i.test(p)) {
      rebuilt.push(p + (parts[i + 1] ?? ''));
      i++;
    } else {
      rebuilt[rebuilt.length - 1] = (rebuilt[rebuilt.length - 1] || '') + p;
      if (rebuilt.length === 0) rebuilt.push(p);
    }
  }
  return rebuilt.filter(Boolean);
}
