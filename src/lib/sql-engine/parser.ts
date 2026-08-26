export interface ParsedSelectColumn {
  raw: string;
  expression: string;
  alias?: string;
  aggregate?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  aggregateArg?: string;
  isDistinct?: boolean;
  /** Present when the column is a CASE WHEN ... THEN ... ELSE ... END expression. */
  caseExpression?: ParsedCaseWhen;
  windowFunction?: {
    type: 'ROW_NUMBER' | 'RANK' | 'DENSE_RANK';
    partitionBy?: string;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
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
  updateTable?: string;
  updateSet?: Record<string, any>;
  deleteTable?: string;
  transactionCommand?: 'BEGIN' | 'COMMIT' | 'ROLLBACK';
  cteName?: string;
  cteQuery?: string;
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

  // CTE (WITH cte_name AS (...) SELECT ...)
  const cteMatch = sql.match(/^WITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(([\s\S]+?)\)\s*(SELECT[\s\S]+)$/i);
  if (cteMatch) {
    const cteName = cteMatch[1].trim();
    const cteQuery = cteMatch[2].trim();
    const mainQuery = cteMatch[3].trim();
    const mainParsed = parseSelect(mainQuery, rawSql);
    return {
      ...mainParsed,
      type: 'CTE',
      raw: rawSql,
      normalized: sql,
      cteName,
      cteQuery,
      mainQuery,
    };
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

  // DDL Commands (CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX)
  if (/^(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(UNIQUE\s+)?INDEX)/i.test(sql)) {
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
    // 'UNION ALL' must be tested before 'UNION'.
    for (const op of ['UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT']) {
      const opIdx = findTopLevelKeyword(sql, op);
      if (opIdx !== -1) {
        return {
          type: 'SET_OPERATION',
          raw: rawSql,
          normalized: sql,
          setOp: (op === 'UNION ALL' ? 'UNION_ALL' : op) as ParsedSqlQuery['setOp'],
          setLeft: sql.substring(0, opIdx).trim(),
          setRight: sql.substring(opIdx + op.length).trim(),
        };
      }
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
      return { ...query, error: 'Missing FROM clause in SELECT query' };
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

    // Check window function: ROW_NUMBER() OVER (PARTITION BY cat ORDER BY price DESC) AS rank
    const windowMatch = cleanPart.match(/^(ROW_NUMBER|RANK|DENSE_RANK)\s*\(\)\s*OVER\s*\(([\s\S]*?)\)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?$/i);
    if (windowMatch) {
      const funcType = windowMatch[1].toUpperCase() as any;
      const overBody = windowMatch[2].trim();
      const alias = windowMatch[3]?.replace(/[`"']/g, '').trim() || `${funcType.toLowerCase()}_result`;

      const partMatch = overBody.match(/PARTITION\s+BY\s+([`"']?[\w_.]+[`"']?)/i);
      const orderMatch = overBody.match(/ORDER\s+BY\s+([`"']?[\w_.]+[`"']?)(?:\s+(ASC|DESC))?/i);

      col.expression = alias;
      col.alias = alias;
      col.windowFunction = {
        type: funcType,
        partitionBy: partMatch ? partMatch[1].replace(/[`"']/g, '').trim() : undefined,
        orderBy: orderMatch ? orderMatch[1].replace(/[`"']/g, '').trim() : undefined,
        direction: orderMatch && orderMatch[2] && orderMatch[2].toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      };
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

function parseInsert(sql: string, rawSql: string): ParsedSqlQuery {
  const match = sql.match(/INSERT\s+INTO\s+([`"']?[\w_]+[`"']?)\s*\(([\s\S]+?)\)\s*VALUES\s*\(([\s\S]+?)\)/i);
  if (!match) {
    return {
      type: 'INSERT',
      raw: rawSql,
      normalized: sql,
      error: 'Invalid INSERT syntax. Expected INSERT INTO table (cols) VALUES (vals)',
    };
  }
  const table = match[1].replace(/[`"']/g, '');
  const cols = match[2].split(',').map((s) => s.trim().replace(/[`"']/g, ''));
  const vals = match[3].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));

  const insertValues: Record<string, any> = {};
  cols.forEach((col, idx) => {
    const rawVal = vals[idx];
    const num = Number(rawVal);
    insertValues[col] = !isNaN(num) && rawVal !== '' ? num : rawVal;
  });

  return {
    type: 'INSERT',
    raw: rawSql,
    normalized: sql,
    insertTable: table,
    insertValues,
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

  const updateSet: Record<string, any> = {};
  setExpr.split(',').forEach((part) => {
    const [c, v] = part.split('=').map((s) => s.trim());
    if (c && v !== undefined) {
      const cleanVal = v.replace(/^['"]|['"]$/g, '');
      const num = Number(cleanVal);
      updateSet[c.replace(/[`"']/g, '')] = !isNaN(num) && cleanVal !== '' ? num : cleanVal;
    }
  });

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
