import { parseSql, ParsedSqlQuery } from './sql-engine/parser';

/**
 * Plain-English explanation of a SQL statement, built on the REAL parser AST
 * (`parseSql`) instead of fragile string regexes (tracker item 13).
 *
 * Every construct the course teaches — SELECT lists (with aggregates, aliases,
 * window functions, CASE), FROM, every JOIN, WHERE, GROUP BY, HAVING,
 * ORDER BY (with direction), LIMIT/OFFSET, CTEs, set operations, all DML/DDL
 * types, transactions, EXPLAIN — maps to a typed field in ParsedSqlQuery, so
 * the explanations are accurate and testable.
 *
 * Returns a list of phrase-sentences; the caller joins them for display.
 */

/** Noun-phrase form of an aggregate (joined later as "Selects the group total (SUM(x))."). */
function describeAggregateNoun(fn: string, expression: string): string {
  switch (fn) {
    case 'COUNT':
      return `the count of rows per group (${expression})`;
    case 'SUM':
      return `the group total (${expression})`;
    case 'AVG':
      return `the group average (${expression})`;
    case 'MIN':
      return `the smallest value in the group (${expression})`;
    case 'MAX':
      return `the largest value in the group (${expression})`;
    default:
      return expression;
  }
}

/** Noun phrase for one selected column — the caller adds "Selects ….". */
function describeSelectColumn(raw: string, expression: string, alias: string | undefined): string {
  const aliasPhrase = alias ? ` as ${alias}` : '';
  if (expression === '*') return 'all columns';
  // Function/window/aggregate text lives in `raw` (parser collapses `expression`
  // to the alias name for these), so test the regexes against raw first.
  const src = /^\w+\s*\(/.test(raw)
    ? raw.replace(/\s+AS\s+[A-Za-z_][A-Za-z0-9_]*\s*$/i, '')
    : expression;
  if (raw.includes('CASE') && raw.includes('END')) return `a CASE expression${aliasPhrase}`;
  if (/^(ROW_NUMBER|RANK|DENSE_RANK)\s*\(/.test(src)) {
    const kind = /^\w+/.exec(src)?.[0].toUpperCase();
    const noun =
      kind === 'ROW_NUMBER' ? 'a row number' : kind === 'RANK' ? 'the rank' : 'the dense rank';
    return `${noun} per row within its partition${aliasPhrase}`;
  }
  if (/^(LAG|LEAD)\s*\(/.test(src)) {
    return `the value from the adjacent row within its partition${aliasPhrase}`;
  }
  if (/^(COUNT|SUM|AVG|MIN|MAX)\s*\(/.test(src)) {
    const fn = /^\w+/.exec(src)?.[0].toUpperCase() ?? '';
    return `${describeAggregateNoun(fn, src)}${aliasPhrase}`;
  }
  if (src.includes('(') && src.includes(')')) return `${src}${aliasPhrase}`;
  return `${expression}${aliasPhrase}`;
}

/** Build a human clause list for a SELECT query's "reads from" segment. */
function describeFrom(query: ParsedSqlQuery): string[] {
  const parts: string[] = [];
  const fromTable = query.fromTable;
  if (fromTable) {
    parts.push(
      `Reads data from table '${fromTable}'${query.fromAlias ? ` (aliased as ${query.fromAlias})` : ''}.`,
    );
  }
  for (const j of query.joins ?? []) {
    const type = j.type === 'INNER' ? 'INNER' : j.type;
    if (j.type === 'CROSS') {
      parts.push(`Cross-joins with table '${j.table}'.`);
    } else {
      const article = /^[AEIOU]/.test(type) ? 'an' : 'a';
      parts.push(
        `Performs ${article} ${type} JOIN with table '${j.table}'${j.alias ? ` (${j.alias})` : ''} on condition ${j.onLeft} = ${j.onRight}.`,
      );
    }
  }
  return parts;
}

/** Explain a SELECT / CTE-main / set-op arm. `label` prefixes phrase 0. */
function explainSelect(query: ParsedSqlQuery): string[] {
  const parts: string[] = [];

  const cols = query.columns ?? [];
  if (cols.length > 0) {
    if (query.isDistinct) parts.push('Returns distinct rows');
    const descriptors: string[] = [];
    for (const c of cols) {
      const desc = describeSelectColumn(c.raw, c.expression, c.alias);
      if (!descriptors.includes(desc)) descriptors.push(desc);
    }
    if (descriptors.length > 0) {
      parts.push(`Selects ${descriptors.join(', ')}.`);
    }
  }

  parts.push(...describeFrom(query));

  if (query.whereClause) {
    parts.push(`Filters records where condition (${query.whereClause}) is satisfied.`);
  }
  if (query.groupBy?.length) {
    parts.push(`Aggregates rows grouped by (${query.groupBy.join(', ')}).`);
  }
  if (query.havingClause) {
    parts.push(`Keeps only groups where (${query.havingClause}).`);
  }
  for (const ob of query.orderBy ?? []) {
    parts.push(`Sorts results by ${ob.column} ${ob.direction === 'DESC' ? 'descending' : 'ascending'}.`);
  }
  if (query.limit !== undefined) {
    parts.push(`Limits output to at most ${query.limit} row(s).`);
  }
  if (query.offset !== undefined) {
    parts.push(`Skips the first ${query.offset} row(s).`);
  }
  return parts;
}

/** Explain a set operation (UNION / UNION ALL / INTERSECT / EXCEPT). */
function explainSetOp(query: ParsedSqlQuery): string[] {
  const op = query.setOp === 'UNION_ALL' ? 'UNION ALL' : query.setOp ?? 'UNION';
  const left = (query.setLeft ?? 'the first query').trim().split('\n')[0];
  const right = (query.setRight ?? 'the second query').trim().split('\n')[0];
  return [
    `Combines the results of two queries with ${op}.`,
    `Left side: ${left.length > 60 ? left.slice(0, 60) + '…' : left}`,
    `Right side: ${right.length > 60 ? right.slice(0, 60) + '…' : right}`,
  ];
}

/** Fallback chain kept from the legacy regex implementation, only used when
 *  parseSql cannot parse the statement. */
function legacyFallback(sql: string): string[] {
  const normalized = sql.trim();
  const out: string[] = [];
  const selectMatch = normalized.match(/SELECT\s+(DISTINCT\s+)?([\s\S]+?)\s+FROM/i);
  if (selectMatch) {
    const distinct = Boolean(selectMatch[1]);
    const cols = selectMatch[2].trim();
    if (cols === '*') out.push(`Retrieves ${distinct ? 'distinct ' : 'all '}columns from the source dataset.`);
    else out.push(`Selects specific columns (${cols})${distinct ? ' removing duplicate values' : ''}.`);
  }
  const fromMatch = normalized.match(/FROM\s+([a-zA-Z0-9_]+)/i);
  if (fromMatch) out.push(`Reads data from table '${fromMatch[1]}'.`);
  const whereMatch = normalized.match(/WHERE\s+([\s\S]+?)(GROUP\s+BY|ORDER\s+BY|LIMIT|;|$)/i);
  if (whereMatch) out.push(`Filters records where condition (${whereMatch[1].trim()}) is satisfied.`);
  const orderMatch = normalized.match(/ORDER\s+BY\s+([\s\S]+?)(LIMIT|;|$)/i);
  if (orderMatch) out.push(`Sorts final results by (${orderMatch[1].trim()}).`);
  return out;
}
/** Main entry: explain a full SQL statement into a list of sentence phrases. */
export function explainQuery(sql: string): string[] {
  if (!sql || !sql.trim()) return ['No SQL query entered yet.'];

  const parsed = parseSql(sql);
  if (parsed.error) {
    const fallback = legacyFallback(sql);
    return fallback.length > 0 ? fallback : ['Executes a SQL statement.'];
  }

  switch (parsed.type) {
    case 'SELECT':
      return explainSelect(parsed);
    case 'CTE': {
      const ctes = parsed.ctes ?? (parsed.cteName ? [{ name: parsed.cteName, query: parsed.cteQuery ?? '' }] : []);
      const names = ctes.map((c) => c.name).join(', ');
      const main = parsed.mainQuery ? parseSql(parsed.mainQuery) : null;
      const mainParts = main && !main.error ? explainSelect(main) : [];
      return [
        `Defines a temporary result set${names ? ` (${names})` : ''} with WITH, then runs the main query against it.`,
        ...mainParts,
      ];
    }
    case 'SET_OPERATION':
      return explainSetOp(parsed);
    case 'INSERT':
      return [
        `Inserts ${parsed.insertValuesList?.length ?? 1} row(s) into table '${parsed.insertTable}'.`,
        ...(parsed.insertValues
          ? [`Columns written: ${Object.keys(parsed.insertValues).join(', ')}.`]
          : []),
      ];
    case 'UPDATE':
      return [
        `Updates table '${parsed.updateTable}', setting ${Object.keys(parsed.updateSet ?? {}).join(', ')}.`,
        parsed.whereClause
          ? `Restricted by WHERE condition (${parsed.whereClause}) — only matching rows change.`
          : 'Caution: no WHERE clause — this updates every row in the table.',
      ];
    case 'DELETE':
      return [
        `Deletes records from table '${parsed.deleteTable}'.`,
        parsed.whereClause
          ? `Restricted by WHERE condition (${parsed.whereClause}) — only matching rows are removed.`
          : 'Caution: no WHERE clause — this deletes every row in the table.',
      ];
    case 'TRANSACTION':
      return [
        parsed.transactionCommand === 'BEGIN'
          ? 'Opens a transaction — changes stay provisional until COMMIT or ROLLBACK.'
          : parsed.transactionCommand === 'COMMIT'
            ? 'Commits the open transaction, making its changes permanent.'
            : 'Rolls back the open transaction, discarding its changes.',
      ];
    case 'DDL':
      return [
        parsed.ddlCommand
          ? `Makes a schema change: ${parsed.ddlCommand.trim().slice(0, 80)}.`
          : 'Executes a data-definition (schema) statement.',
      ];
    case 'EXPLAIN':
      return [
        `Explains how the engine would execute: ${(parsed.explainTarget ?? parsed.raw).trim().slice(0, 80)}.`,
      ];
    default:
      return ['Executes a SQL statement.'];
  }
}