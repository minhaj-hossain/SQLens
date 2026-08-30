import { DatabaseState, QueryExecutionResult, TableRow, ColumnDefinition, TableSchema } from '../../types/database';
import { parseSql, parseCaseExpression, splitFunctionArgs, ParsedSqlQuery, ParsedCaseWhen } from './parser';
import { splitStatements } from './split-statements';
import { INITIAL_TABLES } from '../../content/database/tables';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { SIMULATED_TODAY } from '../../config/simulated-date';

function getRowValue(row: TableRow, colExpr: string): any {
  if (!row) return undefined;
  if (row[colExpr] !== undefined) return row[colExpr];
  const lowerExpr = colExpr.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lowerExpr) return row[k];
  }
  const pureCol = colExpr.includes('.') ? colExpr.split('.')[1] : colExpr;
  if (row[pureCol] !== undefined) return row[pureCol];
  const lowerPure = pureCol.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lowerPure) return row[k];
  }
  return undefined;
}

function splitLogicalClauses(expr: string, operator: 'OR' | 'AND'): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inBetween = false;

  const len = expr.length;
  for (let i = 0; i < len; i++) {
    const ch = expr[i];

    if ((ch === "'" || ch === '"') && (i === 0 || expr[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = ch;
      } else if (stringChar === ch) {
        inString = false;
      }
      current += ch;
      continue;
    }

    if (inString) {
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
      continue;
    }

    if (depth === 0) {
      const rest = expr.slice(i);
      if (/^\bBETWEEN\b/i.test(rest)) {
        inBetween = true;
      }

      if (inBetween && /^\bAND\b/i.test(rest)) {
        inBetween = false;
        current += rest.slice(0, 3);
        i += 2;
        continue;
      }

      if (operator === 'OR' && /^\bOR\b/i.test(rest)) {
        parts.push(current.trim());
        current = '';
        i += 1;
        continue;
      }

      if (operator === 'AND' && /^\bAND\b/i.test(rest)) {
        parts.push(current.trim());
        current = '';
        i += 2;
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

export interface SqlIndexDef {
  name: string; // display name, e.g. 'PRIMARY', 'idx_products_supplier'
  table: string; // lowercase table name
  column: string; // lowercase column name
  unique?: boolean;
}

/** Per-table constraint metadata discovered from a runtime `CREATE TABLE`
 *  statement. Seeded tables have NO meta (constraints are enforced on the
 *  tables learners build with DDL, teaching exactly what the engine executes). */
interface DdlTableMeta {
  autoIncrementCol?: string;
  notNull: string[];
  uniques: string[];
  defaults: Record<string, any>;
  checks: { expr: string }[];
  fks: { col: string; refTable: string; refCol: string }[];
}

/** Map a SQL column type token to the internal data type. */
function sqlTypeToDataType(sqlType: string): string {
  const t = (sqlType || '').toUpperCase();
  if (/^(INT|BIGINT|SMALLINT|TINYINT|MEDIUMINT)/.test(t)) return 'number';
  if (/^BOOL/.test(t)) return 'boolean';
  if (/^(DEC|NUMERIC|FLOAT|DOUBLE|REAL)/.test(t)) return 'decimal';
  if (/^(DATE|TIME)/.test(t)) return 'date';
  return 'string'; // VARCHAR / CHAR / TEXT / ENUM
}

/**
 * Parse the parenthesized body of a CREATE TABLE statement into column
 * definitions and constraint metadata. Understands the DDL-vocabulary SQLens
 * teaches: INT/VARCHAR/DECIMAL/DATE/BOOLEAN, PRIMARY KEY, AUTO_INCREMENT,
 * NOT NULL, UNIQUE, DEFAULT <lit>, CHECK (<expr>), and table-level
 * `FOREIGN KEY (col) REFERENCES tbl(col)`.
 */
function parseColumnDefs(body: string): { cols: ColumnDefinition[]; meta: DdlTableMeta } {
  const parts = splitFunctionArgs(body);
  const cols: ColumnDefinition[] = [];
  const meta: DdlTableMeta = { notNull: [], uniques: [], defaults: {}, checks: [], fks: [] };

  for (const part of parts) {
    const p = part.trim();
    const colMatch = p.match(/^([`"']?[\w]+[`"']?)\s+([A-Za-z]+(?:\([^)]*\))?)\s*([\s\S]*)$/i);
    if (!colMatch) continue;
    const name = colMatch[1].replace(/[`"']/g, '');
    const sqlType = colMatch[2];
    const rest = colMatch[3];
    const def: ColumnDefinition = {
      name,
      type: sqlTypeToDataType(sqlType) as any,
      description: 'Runtime-created column',
    };

    if (/\bNOT\s+NULL\b/i.test(rest)) {
      def.nullable = false;
      meta.notNull.push(name);
    }
    const autoInc = /AUTO_INCREMENT/i.test(rest);
    if (autoInc) meta.autoIncrementCol = name;
    if (/\bPRIMARY\s+KEY\b/i.test(rest)) {
      def.primaryKey = true;
      def.nullable = false;
      if (!autoInc) meta.notNull.push(name);
    }
    const defMatch = rest.match(/DEFAULT\s+([\s\S]+?)(?=\s+(?:NOT\s+NULL|UNIQUE|PRIMARY\s+KEY|CHECK|,)|$)/i);
    if (defMatch) {
      const dv = defMatch[1].trim().replace(/^['"]|['"]$/g, '');
      const dvNum = Number(dv);
      meta.defaults[name] = dv !== '' && !isNaN(dvNum) ? dvNum : dv;
      def.defaultValue = meta.defaults[name];
    }
    if (/\bUNIQUE\b/i.test(rest)) {
      meta.uniques.push(name);
      def.description = 'Runtime-created unique column';
    }
    const chk = rest.match(/CHECK\s*\(([\s\S]+)\)$/i);
    if (chk) meta.checks.push({ expr: chk[1].trim() });

    cols.push(def);
  }

  // Table-level constraints (PRIMARY KEY (...), UNIQUE (...), FOREIGN KEY ...)
  for (const part of parts) {
    const p = part.trim().toLowerCase();
    if (/^primary\s+key\s*\(/i.test(p)) {
      const cm = p.match(/primary\s+key\s*\(([^)]+)\)/i);
      if (cm) {
        const keyCol = cm[1].trim().replace(/[`"']/g, '');
        const cd = cols.find((c) => c.name.toLowerCase() === keyCol.toLowerCase());
        if (cd) {
          cd.primaryKey = true;
          cd.nullable = false;
          if (!meta.autoIncrementCol) meta.notNull.push(cd.name);
        }
      }
    } else if (/^unique\s/i.test(p)) {
      const um = p.match(/unique\s*(?:key|index)?\s*\(([^)]+)\)/i);
      if (um) {
        um[1].split(',').forEach((c) => {
          const cc = c.trim().replace(/[`"']/g, '');
          meta.uniques.push(cc);
        });
      }
    } else if (/^foreign\s+key\s*\(/i.test(p)) {
      const fm = p.match(/foreign\s+key\s*\(([^)]+)\)\s*references\s*([`"']?[\w]+[`"']?)\s*\(([^)]+)\)/i);
      if (fm) {
        const colName = fm[1].trim().replace(/[`"']/g, '');
        const refTable = fm[2].replace(/[`"']/g, '').toLowerCase();
        const refCol = fm[3].trim().replace(/[`"']/g, '');
        meta.fks.push({ col: colName, refTable, refCol });
        const cd = cols.find((c) => c.name.toLowerCase() === colName.toLowerCase());
        if (cd) cd.foreignKey = { table: refTable, column: refCol };
      }
    }
  }

  // De-dupe notNull/uniques (a column can repeat via inline + table-level form)
  meta.notNull = [...new Set(meta.notNull)];
  meta.uniques = [...new Set(meta.uniques)];
  return { cols, meta };
}

export class SqlExecutor {
  private db: DatabaseState;
  private transactionBackup: DatabaseState | null = null;
  private inTransaction: boolean = false;
  /** Index registry — key is the lowercase index name. Seeded from the schema's
   *  PRIMARY KEY columns; extended by `CREATE INDEX`, shrunk by `DROP INDEX`. */
  private indexes: Record<string, SqlIndexDef>;
  private indexBackup: Record<string, SqlIndexDef> | null = null;
  /** Constraint metadata for tables created at runtime via CREATE TABLE. */
  private tableMeta: Record<string, DdlTableMeta> = {};

  constructor(initialDb?: DatabaseState) {
    if (initialDb) {
      this.db = JSON.parse(JSON.stringify(initialDb));
    } else {
      this.db = {
        tables: JSON.parse(JSON.stringify(INITIAL_TABLES)),
        schemas: JSON.parse(JSON.stringify(DATABASE_SCHEMAS)),
      };
    }
    this.indexes = this.seedIndexes();
    this.tableMeta = {};
  }

  /** PRIMARY KEY indexes are the seed state — one per table, on its PK column. */
  private seedIndexes(): Record<string, SqlIndexDef> {
    const out: Record<string, SqlIndexDef> = {};
    for (const schema of Object.values(DATABASE_SCHEMAS)) {
      const pk = schema.columns.find((c) => c.primaryKey);
      if (pk) {
        const table = schema.name.toLowerCase();
        // Key must encode the table: every table has its own PRIMARY index.
        out[`primary:${table}`] = { name: 'PRIMARY', table, column: pk.name.toLowerCase(), unique: true };
      }
    }
    return out;
  }

  public getDatabaseState(): DatabaseState {
    return this.db;
  }

  public resetDatabase(initialDb?: DatabaseState) {
    if (initialDb) {
      this.db = JSON.parse(JSON.stringify(initialDb));
    } else {
      this.db = {
        tables: JSON.parse(JSON.stringify(INITIAL_TABLES)),
        schemas: JSON.parse(JSON.stringify(DATABASE_SCHEMAS)),
      };
    }
    this.transactionBackup = null;
    this.inTransaction = false;
    this.indexes = this.seedIndexes();
    this.indexBackup = null;
    this.tableMeta = {};
  }

  /** Extract simple column predicates from a WHERE clause for plan simulation.
   *  Only used by the EXPLAIN teaching simulation (see docs/DIALECT.md §6). */
  private extractWherePredicates(whereClause: string): { column: string; op: 'eq' | 'range' }[] {
    const out: { column: string; op: 'eq' | 'range' }[] = [];
    for (const clause of splitLogicalClauses(whereClause, 'AND')) {
      const clean = clause.trim();
      const cmp = clean.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s*(>=|<=|!=|<>|=|>|<)/i);
      if (cmp) {
        out.push({
          column: cmp[1].replace(/[`"']/g, '').split('.').pop()!.toLowerCase(),
          op: cmp[2] === '=' ? 'eq' : 'range',
        });
        continue;
      }
      const rangeKw = clean.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s+(BETWEEN|IN|LIKE)\b/i);
      if (rangeKw) {
        out.push({
          column: rangeKw[1].replace(/[`"']/g, '').split('.').pop()!.toLowerCase(),
          op: 'range',
        });
      }
    }
    return out;
  }

  public executeQuery(sql: string): QueryExecutionResult {
    return this.execute(sql);
  }

  public execute(sql: string): QueryExecutionResult {
    const startTime = performance.now();

    // Multi-statement scripts (e.g. `BEGIN; INSERT …; COMMIT;` or migration
    // scripts) execute sequentially on the same database state; the result of
    // the LAST statement is returned. Any statement failing aborts the script.
    const statements = splitStatements(sql);
    // A script that is empty or comment-only yields no statements — report a
    // distinct, honest error instead of the parser's generic "Empty query".
    if (statements.length === 0) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: 'Empty script',
      };
    }
    if (statements.length > 1) {
      let last: QueryExecutionResult | null = null;
      let lastData: QueryExecutionResult | null = null;
      for (const stmt of statements) {
        const r = this.execute(stmt);
        if (!r.success) return r;
        last = r;
        // A transaction-control statement (BEGIN/COMMIT/ROLLBACK) carries no
        // data — when it closes the script, the meaningful outcome is the
        // previous data statement (INSERT/UPDATE/DELETE/SELECT). This keeps
        // validation (expectedRowCount → affectedRows) correct for scripts
        // like `BEGIN; INSERT …; COMMIT;`.
        if (!/^(BEGIN|COMMIT|ROLLBACK)\b/i.test(stmt.trim())) lastData = r;
      }
      const endControl = /^(BEGIN|COMMIT|ROLLBACK)\b/i.test(statements[statements.length - 1].trim());
      if (endControl && lastData) return { ...lastData, executionTimeMs: last.executionTimeMs };
      return (
        last ?? {
          success: false,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0,
          error: 'Empty script',
        }
      );
    }

    const parsed = parseSql(sql);

    if (parsed.error) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        error: parsed.error,
      };
    }

    try {
      if (parsed.type === 'CTE') {
        return this.executeCte(parsed, startTime);
      }

      if (parsed.type === 'EXPLAIN') {
        return this.executeExplain(parsed, startTime);
      }

      if (parsed.type === 'DDL') {
        return this.executeDdl(parsed, startTime);
      }

      if (parsed.type === 'TRANSACTION') {
        return this.handleTransaction(parsed, startTime);
      }

      if (parsed.type === 'SELECT') {
        return this.executeSelect(parsed, startTime);
      }

      if (parsed.type === 'INSERT') {
        return this.executeInsert(parsed, startTime);
      }

      if (parsed.type === 'UPDATE') {
        return this.executeUpdate(parsed, startTime);
      }

      if (parsed.type === 'DELETE') {
        return this.executeDelete(parsed, startTime);
      }

      if (parsed.type === 'SET_OPERATION') {
        return this.executeSetOperation(parsed, startTime);
      }

      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        error: 'Unsupported statement type',
      };
    } catch (err: any) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        error: err.message || 'Execution error',
      };
    }
  }

// ---------------------------------------------------------------------
  // Set operations (UNION [ALL] / INTERSECT / EXCEPT).
  // ---------------------------------------------------------------------
  private executeSetOperation(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const leftSql = parsed.setLeft;
    const rightSql = parsed.setRight;
    const op = parsed.setOp;
    if (!leftSql || !rightSql || !op) {
      throw new Error('Invalid set-operation query (missing side or operator).');
    }

    const leftRes = this.execute(leftSql);
    if (!leftRes.success) {
      throw new Error(`Error in the left side of ${op}: ${leftRes.error}`);
    }
    const rightRes = this.execute(rightSql);
    if (!rightRes.success) {
      throw new Error(`Error in the right side of ${op}: ${rightRes.error}`);
    }

    // Shape compatibility: both sides must return the same number of columns.
    // (Taught concept — "column alignment rules".) Silently concatenating
    // mismatched shapes would hide bugs, so it errors loudly.
    if (leftRes.columns.length !== rightRes.columns.length) {
      throw new Error(
        `${op} requires both sides to return the same number of columns ` +
          `(left side: ${leftRes.columns.length}, right side: ${rightRes.columns.length}).`
      );
    }

    // Set operations compare rows by VALUE POSITION, not by column name:
    // `SELECT 1 AS month EXCEPT SELECT EXTRACT(MONTH FROM d)` must match even
    // though the two sides label their columns differently (standard SQL
    // compares result columns positionally after shape validation).
    //
    // Rows are therefore normalized to positional value arrays before any
    // set logic runs. This also matters for NESTED set operations: a chained
    // `A UNION B UNION C` evaluates `A UNION B` first, whose rows are keyed by
    // A's column names — looking those rows up by C's column names would yield
    // undefined for every value and silently collapse distinct rows during
    // dedupe/EXCEPT matching.
    const positional = (res: QueryExecutionResult): unknown[][] =>
      res.rows.map((r) => res.columns.map((c) => r[c] ?? null));
    const keyOf = (vals: unknown[]): string =>
      vals.map((v) => (v === null || v === undefined ? '' : String(v))).join('¦');
    const toRow = (vals: unknown[]): TableRow => {
      const o: TableRow = {};
      leftRes.columns.forEach((c, i) => {
        o[c] = vals[i] ?? null;
      });
      return o;
    };
    const leftVals = positional(leftRes);
    const rightVals = positional(rightRes);

    let rows: TableRow[];
    switch (op) {
      case 'UNION_ALL':
        rows = [...leftVals, ...rightVals].map(toRow);
        break;
      case 'UNION': {
        const seen = new Set<string>();
        const kept: unknown[][] = [];
        for (const vals of [...leftVals, ...rightVals]) {
          const k = keyOf(vals);
          if (!seen.has(k)) {
            seen.add(k);
            kept.push(vals);
          }
        }
        rows = kept.map(toRow);
        break;
      }
      case 'INTERSECT': {
        const presentRight = new Set(rightVals.map(keyOf));
        const seen = new Set<string>();
        const kept: unknown[][] = [];
        for (const vals of leftVals) {
          const k = keyOf(vals);
          if (!presentRight.has(k) || seen.has(k)) continue;
          seen.add(k);
          kept.push(vals);
        }
        rows = kept.map(toRow);
        break;
      }
      case 'EXCEPT': {
        const presentRight = new Set(rightVals.map(keyOf));
        const seen = new Set<string>();
        const kept: unknown[][] = [];
        for (const vals of leftVals) {
          const k = keyOf(vals);
          if (presentRight.has(k) || seen.has(k)) continue;
          seen.add(k);
          kept.push(vals);
        }
        rows = kept.map(toRow);
        break;
      }
      default:
        throw new Error(`Unsupported set operation: ${op}`);
    }

    return {
      success: true,
      columns: leftRes.columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  // ---------------------------------------------------------------------
  // CASE WHEN support (reused by SELECT projection).
  // ---------------------------------------------------------------------
  private evaluateCase(caseExpr: ParsedCaseWhen, row: TableRow): any {
    for (const when of caseExpr.whens) {
      if (this.evaluateWhere(when.condition, row)) {
        return this.resolveCaseResult(when.result, row);
      }
    }
    if (caseExpr.elseResult !== undefined) {
      return this.resolveCaseResult(caseExpr.elseResult, row);
    }
    return null;
  }

  /**
   * Rows of the group currently being projected. Set only while evaluating a
   * grouped CASE expression so aggregate conditions like
   * `CASE WHEN COUNT(o.order_id) >= 3 THEN 'Gold' …` can be resolved.
   */
  private currentAggRows: TableRow[] | null = null;

  /**
   * Evaluates a scalar expression to a single value: string/number literal,
   * CURDATE(), a column reference, or a flat function call
   * (UPPER/LOWER/TRIM/LENGTH/CONCAT/SUBSTRING/YEAR/MONTH/DAY/EXTRACT/DATEDIFF).
   */
  private evaluateScalar(row: TableRow, expr: string): any {
    const t = (expr ?? '').trim();
    if (!t) return undefined;
    if (/^['"]/.test(t)) return t.replace(/^['"]|['"]$/g, '');
    if (/^CURDATE\(\)$/i.test(t)) return SIMULATED_TODAY;
    const fn = t.match(/^([A-Za-z_]+)\s*\(([\s\S]*)\)$/);
    if (fn) {
      const fnName = fn[1].toUpperCase();
      const fnArgs = splitFunctionArgs(fn[2]);
      // Inside a grouped CASE condition, aggregate calls evaluate over the group
      if (this.currentAggRows && ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(fnName)) {
        return this.computeAggregate(fnName, fnArgs.join(','), this.currentAggRows);
      }
      return this.evaluateFunctionCall(fnName, fnArgs, row);
    }
    const num = Number(t);
    if (t !== '' && !isNaN(num)) return num;
    return getRowValue(row, t);
  }

  /** Evaluates a flat scalar function call against a row. */
  private evaluateFunctionCall(name: string, args: string[], row: TableRow): any {
    const arg = (i: number) => this.evaluateScalar(row, args[i]);
    switch (name) {
      case 'UPPER': return arg(0) === null || arg(0) === undefined ? null : String(arg(0)).toUpperCase();
      case 'LOWER': return arg(0) === null || arg(0) === undefined ? null : String(arg(0)).toLowerCase();
      case 'TRIM': return arg(0) === null || arg(0) === undefined ? null : String(arg(0)).trim();
      case 'LENGTH': return arg(0) === null || arg(0) === undefined ? null : String(arg(0)).length;
      case 'CONCAT':
        return args.map((a) => String(this.evaluateScalar(row, a) ?? '')).join('');
      case 'SUBSTRING': {
        const s = String(arg(0) ?? '');
        const start = Number(args[1]) || 1;
        const len = args[2] !== undefined ? Number(args[2]) : undefined;
        return len !== undefined ? s.substring(start - 1, start - 1 + len) : s.substring(start - 1);
      }
      case 'YEAR': return this.extractDatePart(arg(0), 'YEAR');
      case 'MONTH': return this.extractDatePart(arg(0), 'MONTH');
      case 'DAY': return this.extractDatePart(arg(0), 'DAY');
      case 'EXTRACT': {
        // Canonical EXTRACT form: EXTRACT(YEAR FROM col) — one arg string.
        const em = String(args[0] ?? '').match(/^\s*(YEAR|MONTH|DAY)\s+FROM\s+([\s\S]+)\s*$/i);
        if (em) return this.extractDatePart(this.evaluateScalar(row, em[2]), em[1].toUpperCase());
        return this.extractDatePart(arg(0), 'YEAR');
      }
      case 'DATEDIFF': {
        const a = new Date(String(arg(0) ?? ''));
        const b = new Date(String(arg(1) ?? ''));
        const ms = a.getTime() - b.getTime();
        return isNaN(a.getTime()) || isNaN(b.getTime()) ? null : Math.round(ms / 86400000);
      }
      default:
        return null;
    }
  }

  /**
   * Evaluates simple arithmetic over columns/literals/functions, e.g.
   * `quantity * unit_price`, `revenue - prev_revenue`. Top-level split on
   * the first + - * / operator outside parentheses.
   */
  private evaluateArithmetic(row: TableRow, expr: string): any {
    const t = (expr ?? '').trim();
    let level = 0;
    let opIdx = -1;
    let op = '';
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (ch === '(') { level++; continue; }
      if (ch === ')') { level--; continue; }
      if (level === 0 && (ch === '+' || ch === '-' || ch === '*' || ch === '/')) {
        opIdx = i;
        op = ch;
        break;
      }
    }
    if (opIdx === -1) return undefined;
    const left = this.evaluateScalar(row, t.slice(0, opIdx));
    const right = this.evaluateScalar(row, t.slice(opIdx + 1));
    if (left === null || left === undefined || right === null || right === undefined) return null;
    const ln = Number(left);
    const rn = Number(right);
    if (isNaN(ln) || isNaN(rn)) return null;
    switch (op) {
      case '+': return ln + rn;
      case '-': return ln - rn;
      case '*': return ln * rn;
      case '/': return rn === 0 ? null : ln / rn;
      default: return null;
    }
  }

  /** Extracts a date component from a 'YYYY-MM-DD…' value (UTC-safe). */
  private extractDatePart(value: any, part: string): number | null {
    if (value === null || value === undefined) return null;
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return null;
    switch (part) {
      case 'YEAR': return d.getUTCFullYear();
      case 'MONTH': return d.getUTCMonth() + 1;
      case 'DAY': return d.getUTCDate();
      default: return null;
    }
  }

  private resolveCaseResult(result: string, row: TableRow): any {
    const t = result.trim();
    if (t.startsWith("'") || t.startsWith('"')) {
      return t.replace(/^['"]|['"]$/g, '');
    }
    const num = Number(t);
    if (t !== '' && !isNaN(num)) return num;
    const v = getRowValue(row, t);
    if (v !== undefined) return v;
    return t;
  }
  private executeCte(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const mainSql = parsed.mainQuery;
    const ctes = parsed.ctes ?? (parsed.cteQuery && parsed.cteName ? [{ name: parsed.cteName, query: parsed.cteQuery }] : []);
    if (ctes.length === 0 || !mainSql) {
      throw new Error('Invalid Common Table Expression syntax');
    }

    // Execute every CTE definition in order, registering each as a temporary table.
    const backups = new Map<string, TableRow[] | undefined>();
    for (const cte of ctes) {
      const cteRes = this.execute(cte.query);
      if (!cteRes.success) {
        throw new Error(`Error executing CTE '${cte.name}': ${cteRes.error}`);
      }
      const name = cte.name.toLowerCase();
      backups.set(name, this.db.tables[name]);
      this.db.tables[name] = cteRes.rows;
    }

    try {
      const mainRes = this.execute(mainSql);
      mainRes.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return mainRes;
    } finally {
      for (const [name, prev] of backups.entries()) {
        if (prev !== undefined) {
          this.db.tables[name] = prev;
        } else {
          delete this.db.tables[name];
        }
      }
    }
  }

  private executeExplain(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const target = parsed.explainTarget || '';
    const parsedTarget = parseSql(target);
    const t = (parsedTarget.fromTable || 'products').toLowerCase();
    const tableLen = this.db.tables[t]?.length ?? 0;

    const tableIndexes = Object.values(this.indexes).filter((i) => i.table === t);
    const possibleKeys = tableIndexes.length ? tableIndexes.map((i) => i.name).join(', ') : null;

    let type: string = 'ALL';
    let key: string | null = null;
    let rows: number = tableLen || 1;
    let extra = '';

    if (parsedTarget.whereClause) {
      for (const pred of this.extractWherePredicates(parsedTarget.whereClause)) {
        const idx = tableIndexes.find((i) => i.column === pred.column);
        if (!idx) continue; // no index on this column → keep scanning other predicates
        if (pred.op === 'eq' && idx.unique) {
          type = 'const';
          key = idx.name;
          rows = 1;
          extra = 'Using where';
          break;
        }
        type = pred.op === 'eq' ? 'ref' : 'range';
        key = idx.name;
        rows = Math.max(1, Math.round((tableLen || 1) / 4));
        extra = 'Using index condition; Using where';
        break;
      }
    }

    const columns = ['id', 'select_type', 'table', 'type', 'possible_keys', 'key', 'rows', 'Extra'];
    const resultRow = {
      id: 1,
      select_type: 'SIMPLE',
      table: t,
      type,
      possible_keys: possibleKeys,
      key,
      rows,
      Extra: type === 'ALL' ? '' : extra,
    };

    return {
      success: true,
      columns,
      rows: [resultRow],
      rowCount: 1,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private executeDdl(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const cmd = parsed.ddlCommand || '';

    // CREATE TABLE
    const createMatch = cmd.match(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?([`"']?[\w_]+[`"']?)/i);
    if (createMatch) {
      const tbl = createMatch[2].replace(/[`"']/g, '').toLowerCase();
      const ifNotExists = !!createMatch[1];
      if (this.db.tables[tbl]) {
        // v2 DDL fix: re-creating an existing table is an error (mirrors
        // real SQL behavior). `IF NOT EXISTS` suppresses it silently.
        if (!ifNotExists) {
          return {
            success: false,
            columns: [],
            rows: [],
            rowCount: 0,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
            error: `Table '${tbl}' already exists. Use CREATE TABLE IF NOT EXISTS to ignore, or DROP TABLE first.`,
          };
        }
        return {
          success: true,
          columns: ['status'],
          rows: [{ status: `Table '${tbl}' already exists (IF NOT EXISTS — no change)` }],
          rowCount: 1,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        };
      }
      const bodyMatch = cmd.match(/\(([\s\S]+)\)\s*$/i);
      const body = bodyMatch ? bodyMatch[1] : '';
      const { cols, meta } = parseColumnDefs(body);
      const schema: TableSchema = {
        name: tbl,
        displayName: tbl
          .split('_')
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(' '),
        description: 'Runtime-created table (CREATE TABLE)',
        columns: cols,
      };
      this.db.tables[tbl] = [];
      this.db.schemas[tbl] = schema;
      if (cols.length > 0 || meta.fks.length > 0 || meta.checks.length > 0) {
        // Only meaningful metadata when the statement actually defined columns
        // (keeps loose DDL like `CREATE TABLE x (id INT)` honest too).
        this.tableMeta[tbl] = meta;
      }
      const pk = cols.find((c) => c.primaryKey);
      if (pk) {
        this.indexes[`primary:${tbl}`] = {
          name: 'PRIMARY',
          table: tbl,
          column: pk.name.toLowerCase(),
          unique: true,
        };
      }
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Table '${tbl}' created successfully (0 rows affected)` }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    // DROP TABLE — removes the table (data + schema + constraints metadata) so a
    // subsequent CREATE of the same name truly starts fresh, mirroring real SQL.
    const dropMatch = cmd.match(/DROP\s+TABLE\s+(IF\s+EXISTS\s+)?([`"']?[\w_]+[`"']?)/i);
    if (dropMatch) {
      const tbl = dropMatch[2].replace(/[`"']/g, '').toLowerCase();
      if (!this.db.tables[tbl]) {
        return {
          success: true,
          columns: ['status'],
          rows: [{ status: `Table '${tbl}' does not exist (IF EXISTS — no-op)` }],
          rowCount: 1,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        };
      }
      delete this.db.tables[tbl];
      delete this.db.schemas[tbl];
      delete this.tableMeta[tbl];
      delete this.indexes[`primary:${tbl}`];
      // Also drop any custom indexes registered on this table.
      for (const key of Object.keys(this.indexes)) {
        if (this.indexes[key].table === tbl) delete this.indexes[key];
      }
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Table '${tbl}' dropped` }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    // ALTER TABLE
    const alterMatch = cmd.match(/ALTER\s+TABLE\s+([`"']?[\w_]+[`"']?)\s+ADD\s+COLUMN\s+([`"']?[\w_]+[`"']?)\s+([a-zA-Z0-9_()]+)(?:\s+DEFAULT\s+([\s\S]+))?/i);
    if (alterMatch) {
      const tbl = alterMatch[1].replace(/[`"']/g, '').toLowerCase();
      const colName = alterMatch[2].replace(/[`"']/g, '');
      const defVal = alterMatch[4] ? alterMatch[4].replace(/^['"]|['"]$/g, '').trim() : null;

      if (this.db.tables[tbl]) {
        this.db.tables[tbl] = this.db.tables[tbl].map(row => ({
          ...row,
          [colName]: defVal ?? null,
        }));
      }

      // Keep the schema/metadata in sync so the new column resolves in later
      // queries and new rows inherit the DEFAULT.
      if (!this.db.schemas[tbl]) {
        this.db.schemas[tbl] = {
          name: tbl,
          displayName: tbl
            .split('_')
            .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
            .join(' '),
          description: 'Runtime-created table (ALTER TABLE)',
          columns: [],
        };
      }
      const colType = alterMatch[3].toUpperCase().replace(/\(.*$/, '');
      const colDef: ColumnDefinition = {
        name: colName,
        type: sqlTypeToDataType(colType) as any,
        description: 'Runtime-created column',
      };
      if (defVal !== null) {
        const dvNum = Number(defVal);
        colDef.defaultValue = !isNaN(dvNum) && defVal !== '' ? dvNum : defVal;
      }
      if (!this.db.schemas[tbl].columns.some((c) => c.name.toLowerCase() === colName.toLowerCase())) {
        this.db.schemas[tbl].columns.push(colDef);
      }
      if (!this.tableMeta[tbl]) {
        this.tableMeta[tbl] = { notNull: [], uniques: [], defaults: {}, checks: [], fks: [] };
      }
      if (defVal !== null) {
        const dvNum = Number(defVal);
        this.tableMeta[tbl].defaults[colName] = !isNaN(dvNum) && defVal !== '' ? dvNum : defVal;
      }

      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Table '${tbl}' altered: column '${colName}' added successfully` }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    // CREATE INDEX
    const createIndexMatch = cmd.match(/^CREATE\s+(UNIQUE\s+)?INDEX\s+([`"']?[\w_]+[`"']?)\s+ON\s+([`"']?[\w_]+[`"']?)\s*\(([^)]+)\)/i);
    if (createIndexMatch) {
      const name = createIndexMatch[2].replace(/[`"']/g, '').trim();
      const tbl = createIndexMatch[3].replace(/[`"']/g, '').toLowerCase();
      const col = createIndexMatch[4].replace(/[`"']/g, '').trim();
      const key = name.toLowerCase();

      if (!this.db.tables[tbl]) {
        return {
          success: false,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          error: `Table '${tbl}' doesn't exist — cannot create index '${name}'.`,
        };
      }
      if (this.indexes[key]) {
        return {
          success: false,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          error: `Duplicate key name '${name}' — an index with this name already exists.`,
        };
      }
      const colLower = col.split(' ')[0].toLowerCase();
      this.indexes[key] = { name, table: tbl, column: colLower, unique: !!createIndexMatch[1] };
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Index '${name}' created on ${tbl}(${colLower})` }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    // DROP INDEX
    const dropIndexMatch = cmd.match(/^DROP\s+INDEX\s+([`"']?[\w_]+[`"']?)(?:\s+ON\s+([`"']?[\w_]+[`"']?))?/i);
    if (dropIndexMatch) {
      const name = dropIndexMatch[1].replace(/[`"']/g, '').trim();
      const key = name.toLowerCase();
      if (!this.indexes[key]) {
        return {
          success: false,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          error: `Index '${name}' does not exist.`,
        };
      }
      delete this.indexes[key];
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Index '${name}' dropped` }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    return {
      success: true,
      columns: ['status'],
      rows: [{ status: 'DDL command executed successfully' }],
      rowCount: 1,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private handleTransaction(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const cmd = parsed.transactionCommand;
    if (cmd === 'BEGIN') {
      this.inTransaction = true;
      this.transactionBackup = JSON.parse(JSON.stringify(this.db));
      this.indexBackup = JSON.parse(JSON.stringify(this.indexes));
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: 'Transaction started (atomicity active)' }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        transactionStatus: 'in_transaction',
      };
    } else if (cmd === 'COMMIT') {
      this.inTransaction = false;
      this.transactionBackup = null;
      this.indexBackup = null;
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: 'Transaction committed successfully' }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        transactionStatus: 'committed',
      };
    } else if (cmd === 'ROLLBACK') {
      if (this.transactionBackup) {
        this.db = this.transactionBackup;
        this.transactionBackup = null;
      }
      if (this.indexBackup) {
        this.indexes = this.indexBackup;
        this.indexBackup = null;
      }
      this.inTransaction = false;
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: 'Transaction rolled back (changes reverted)' }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        transactionStatus: 'rolled_back',
      };
    }

    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      error: 'Unknown transaction command',
    };
  }

  private executeSelect(query: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const tableName = query.fromTable?.toLowerCase();

    // FROM-less SELECT (`SELECT 1 AS month`, `SELECT 'customer' AS source`):
    // project the constant select list against a single empty row context.
    // Used for building constant sets (e.g. a month calendar) that feed
    // set operations like EXCEPT.
    if (!tableName) {
      if (query.columns?.some(c => c.expression.trim() === '*')) {
        throw new Error('SELECT * requires a FROM clause.');
      }
      const emptyRow: TableRow = {};
      const projected: TableRow = {};
      const outCols: string[] = [];
      query.columns?.forEach(col => {
        const outputCol = col.alias || col.expression;
        outCols.push(outputCol);
        if (col.caseExpression) {
          projected[outputCol] = this.evaluateCase(col.caseExpression, emptyRow);
        } else if (col.functionCall) {
          projected[outputCol] = this.evaluateFunctionCall(col.functionCall.name, col.functionCall.args, emptyRow);
        } else if (/^'[^']*'$/.test(col.expression.trim())) {
          projected[outputCol] = col.expression.trim().slice(1, -1);
        } else if (/^-?\d+(\.\d+)?$/.test(col.expression.trim())) {
          projected[outputCol] = Number(col.expression.trim());
        } else {
          // Column reference with no table — resolves to NULL (constant context).
          projected[outputCol] = null;
        }
      });
      return {
        success: true,
        columns: outCols,
        rows: [projected],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }

    if (!this.db.tables[tableName]) {
      throw new Error(`Table '${query.fromTable}' does not exist in database.`);
    }

    // 1. FROM clause - load base rows with alias/table prefixed keys
    const fromAlias = query.fromAlias || tableName;
    let currentRows: TableRow[] = this.db.tables[tableName].map(r => {
      const row: TableRow = { ...r };
      Object.keys(r).forEach(k => {
        row[`${tableName}.${k}`] = r[k];
        if (fromAlias) row[`${fromAlias}.${k}`] = r[k];
      });
      return row;
    });

    // 2. JOINs
    if (query.joins && query.joins.length > 0) {
      for (const join of query.joins) {
        const joinTable = join.table.toLowerCase();
        const joinAlias = join.alias || joinTable;
        const targetData = this.db.tables[joinTable];
        if (!targetData) {
          throw new Error(`Table '${join.table}' in JOIN clause does not exist.`);
        }
        const leftTable = tableName;
        const leftAlias = fromAlias || tableName;

        const buildNullSide = (side: 'left' | 'right'): Record<string, any> => {
          const srcTable = side === 'right' ? joinTable : leftTable;
          const srcData = side === 'right' ? targetData : this.db.tables[leftTable];
          const prefix = side === 'right' ? joinAlias : leftAlias;
          // Mirror prefixed keys so getRowValue can resolve qualified columns.
          const nullSide: Record<string, any> = {};
          const schema = this.db.schemas[srcTable];
          if (schema) {
            schema.columns.forEach((col) => {
              nullSide[col.name] = null;
              nullSide[`${srcTable}.${col.name}`] = null;
              if (prefix) nullSide[`${prefix}.${col.name}`] = null;
            });
          } else if (srcData && srcData.length > 0) {
            Object.keys(srcData[0]).forEach((k) => {
              nullSide[k] = null;
              nullSide[`${srcTable}.${k}`] = null;
              if (prefix) nullSide[`${prefix}.${k}`] = null;
            });
          }
          return nullSide;
        };

        const mergeRow = (row: TableRow, targetRow: TableRow): TableRow => {
          const merged: TableRow = { ...row };
          Object.keys(targetRow).forEach((k) => {
            merged[`${joinTable}.${k}`] = targetRow[k];
            if (joinAlias) merged[`${joinAlias}.${k}`] = targetRow[k];
            if (merged[k] === undefined) merged[k] = targetRow[k];
          });
          return merged;
        };

        const matches = (row: TableRow, targetRow: TableRow): boolean => {
          if (join.type === 'CROSS') return true;
          const vLeft = getRowValue(row, join.onLeft);
          const vRight = getRowValue(targetRow, join.onRight);
          const vLeftAlt = getRowValue(row, join.onRight);
          const vRightAlt = getRowValue(targetRow, join.onLeft);
          return (
            (vLeft !== undefined && vRight !== undefined && vLeft == vRight) ||
            (vLeftAlt !== undefined && vRightAlt !== undefined && vLeftAlt == vRightAlt)
          );
        };

        const newRows: TableRow[] = [];

        if (join.type === 'CROSS') {
          for (const row of currentRows) {
            for (const targetRow of targetData) {
              newRows.push(mergeRow(row, targetRow));
            }
          }
        } else if (join.type === 'INNER') {
          for (const row of currentRows) {
            for (const targetRow of targetData) {
              if (matches(row, targetRow)) newRows.push(mergeRow(row, targetRow));
            }
          }
        } else {
          // LEFT / RIGHT / FULL — need matched + unmatched sides.
          const matchedLeft = new Set<TableRow>();
          const matchedRight = new Set<TableRow>();
          for (const row of currentRows) {
            for (const targetRow of targetData) {
              if (matches(row, targetRow)) {
                newRows.push(mergeRow(row, targetRow));
                matchedLeft.add(row);
                matchedRight.add(targetRow);
              }
            }
          }
          if (join.type === 'LEFT' || join.type === 'FULL') {
            for (const row of currentRows) {
              if (!matchedLeft.has(row)) {
                newRows.push({ ...row, ...buildNullSide('right') });
              }
            }
          }
          if (join.type === 'RIGHT' || join.type === 'FULL') {
            const nullLeft = buildNullSide('left');
            for (const targetRow of targetData) {
              if (!matchedRight.has(targetRow)) {
                newRows.push({ ...nullLeft, ...targetRow });
              }
            }
          }
        }

        currentRows = newRows;
      }
    }

    // 3. WHERE clause filtering
    if (query.whereClause) {
      currentRows = currentRows.filter(row => this.evaluateWhere(query.whereClause!, row));
    }

    // 4. GROUP BY & Aggregations
    let finalColumns: string[] = [];
    let projectedRows: TableRow[] = [];

    const hasAggregates = query.columns?.some(c => !!c.aggregate);
    const hasGroupBy = query.groupBy && query.groupBy.length > 0;

    if (hasGroupBy || hasAggregates) {
      const groups: Record<string, TableRow[]> = {};
      if (hasGroupBy) {
        currentRows.forEach(row => {
          const key = query.groupBy!.map(col => {
            // GROUP BY may reference expressions (e.g. YEAR(order_date))
            const v = /\(/.test(col) ? this.evaluateScalar(row, col) : getRowValue(row, col);
            return String(v ?? '');
          }).join('___');
          if (!groups[key]) groups[key] = [];
          groups[key].push(row);
        });
      } else {
        groups['all'] = currentRows;
      }

      for (const key of Object.keys(groups)) {
        const groupRows = groups[key];
        const projected: TableRow = {};

        // Calculate projections
        query.columns?.forEach(col => {
          const colName = col.alias || (col.expression.includes('.') ? col.expression.split('.')[1] : col.expression);
          if (col.caseExpression) {
            // Grouped CASE may reference aggregates in its conditions
            // (e.g. CASE WHEN COUNT(o.order_id) >= 3 THEN 'Gold' END).
            this.currentAggRows = groupRows;
            try {
              projected[colName] = groupRows[0] ? this.evaluateCase(col.caseExpression, groupRows[0]) : null;
            } finally {
              this.currentAggRows = null;
            }
          } else if (col.aggregate) {
            let aggVal: any = this.computeAggregate(col.aggregate, col.aggregateArg || '', groupRows);
            // COALESCE(<agg>(x), fallback): substitute the fallback literal when
            // the aggregate yields NULL (e.g. SUM over an all-NULL group).
            if (col.coalesceFallback !== undefined && (aggVal === null || aggVal === undefined)) {
              const fb = col.coalesceFallback.replace(/^['"]|['"]$/g, '');
              aggVal = fb !== '' && !isNaN(Number(fb)) ? Number(fb) : fb;
            }
            projected[colName] = aggVal;
          } else if (col.functionCall) {
            // Function args may reference aggregates inside a grouped query
            // (e.g. DATEDIFF(CURDATE(), MAX(o.order_date))).
            this.currentAggRows = groupRows;
            try {
              projected[colName] = groupRows[0]
                ? this.evaluateFunctionCall(col.functionCall.name, col.functionCall.args, groupRows[0])
                : null;
            } finally {
              this.currentAggRows = null;
            }
          } else {
            // Quoted / numeric literal in a grouped query (tagged reports)
            const trimmed = col.expression.trim();
            const strLit = trimmed.match(/^'([^']*)'$/);
            const numLit = trimmed.match(/^-?\d+(\.\d+)?$/);
            if (strLit) {
              projected[colName] = strLit[1];
            } else if (numLit) {
              projected[colName] = Number(trimmed);
            } else {
              // Take first row value for grouped columns
              projected[colName] = groupRows[0] ? getRowValue(groupRows[0], col.expression) : null;
            }
          }
        });

        // HAVING filter check with direct aggregate evaluation over groupRows
        if (query.havingClause) {
          let evaluatedHaving = query.havingClause;
          
          // 1. Replace aliases
          query.columns?.forEach(col => {
            const alias = col.alias || col.expression;
            if (col.aggregate && alias) {
              const fullAggPattern = new RegExp(`\\b${col.aggregate}\\s*\\([^)]*\\)`, 'gi');
              evaluatedHaving = evaluatedHaving.replace(fullAggPattern, alias);
            }
          });

          // 2. Evaluate remaining inline aggregates: e.g. COUNT(oi.order_item_id)
          const inlineAggs = evaluatedHaving.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]*)\)/gi);
          if (inlineAggs) {
            for (const aggExpr of inlineAggs) {
              const parts = aggExpr.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]*)\)/i);
              if (parts) {
                const val = this.computeAggregate(parts[1].toUpperCase(), parts[2], groupRows);
                evaluatedHaving = evaluatedHaving.replace(aggExpr, String(val));
              }
            }
          }

          if (this.evaluateWhere(evaluatedHaving, projected)) {
            projectedRows.push(projected);
          }
        } else {
          projectedRows.push(projected);
        }
      }
    } else {
      // 5. Standard SELECT projection
      const isSelectAll = query.columns?.some(c => c.expression.trim() === '*');
      if (isSelectAll) {
        projectedRows = currentRows;
        if (currentRows.length > 0) {
          finalColumns = Object.keys(currentRows[0]);
        } else {
          const schema = this.db.schemas[tableName];
          finalColumns = schema ? schema.columns.map(c => c.name) : [];
        }
      } else {
        projectedRows = currentRows.map(row => {
          const projected: TableRow = {};
          query.columns?.forEach(col => {
            const outputCol = col.alias || (col.expression.includes('.') ? col.expression.split('.')[1] : col.expression);
            const srcCol = col.expression;
            
            // CASE WHEN result
            if (col.caseExpression) {
              projected[outputCol] = this.evaluateCase(col.caseExpression, row);
            }
            // Scalar function expression (UPPER(name), CONCAT(...), YEAR(...), …)
            else if (col.functionCall) {
              projected[outputCol] = this.evaluateFunctionCall(col.functionCall.name, col.functionCall.args, row);
            }
            // Quoted literal (e.g. 'customer' AS source in tagged UNION queries)
            else if (!col.windowFunction && /^'[^']*'$/.test(srcCol.trim())) {
              projected[outputCol] = srcCol.trim().slice(1, -1);
            }
            // Numeric literal (e.g. 1 AS flag)
            else if (!col.windowFunction && /^-?\d+(\.\d+)?$/.test(srcCol.trim())) {
              projected[outputCol] = Number(srcCol.trim());
            }
            // Check computed arithmetic expressions
            // (quantity * unit_price, revenue - prev_revenue, …)
            else if (!col.windowFunction && /[+\-*/]/.test(srcCol)) {
              const ar = this.evaluateArithmetic(row, srcCol);
              projected[outputCol] =
                ar !== undefined
                  ? ar
                  : getRowValue(row, srcCol) !== undefined
                  ? getRowValue(row, srcCol)
                  : null;
            } else if (!col.windowFunction && !col.aggregate) {
              projected[outputCol] = getRowValue(row, srcCol) !== undefined ? getRowValue(row, srcCol) : null;
            }
          });
          return projected;
        });
      }
    }

    // Window Functions post-pass:
    //   ROW_NUMBER/RANK/DENSE_RANK (tie-aware),
    //   SUM/COUNT/AVG/MIN/MAX OVER (ORDER BY …)  → running/rolling to current row,
    //   LAG/LEAD(col[, offset[, default]]) OVER (…).
    const windowCols = query.columns?.filter(c => !!c.windowFunction);
    if (windowCols && windowCols.length > 0) {
      windowCols.forEach(winCol => {
        const win = winCol.windowFunction!;
        const partKey = win.partitionBy;
        const orderKey = win.orderBy;
        const outName = winCol.alias || winCol.expression;
        const type = win.type;

        // Group rows by partition (in projection order).
        const partitions: Record<string, TableRow[]> = {};
        projectedRows.forEach(r => {
          const pk = partKey ? String(getRowValue(r, partKey) ?? '') : 'all';
          if (!partitions[pk]) partitions[pk] = [];
          partitions[pk].push(r);
        });

        Object.values(partitions).forEach(partRows => {
          if (orderKey) {
            partRows.sort((a, b) => {
              const va = getRowValue(a, orderKey);
              const vb = getRowValue(b, orderKey);
              if (va === vb) return 0;
              if (va === null || va === undefined) return win.direction === 'ASC' ? 1 : -1;
              if (vb === null || vb === undefined) return win.direction === 'ASC' ? -1 : 1;
              if (typeof va === 'number' && typeof vb === 'number') {
                return win.direction === 'ASC' ? va - vb : vb - va;
              }
              return win.direction === 'ASC'
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
            });
          }
          const sortVal = (r: TableRow) => (orderKey ? getRowValue(r, orderKey) : undefined);

          if (type === 'ROW_NUMBER') {
            partRows.forEach((r, idx) => { r[outName] = idx + 1; });
          } else if (type === 'RANK' || type === 'DENSE_RANK') {
            // Ties share a rank; RANK gaps, DENSE_RANK does not.
            let prevVal: unknown = undefined;
            let rank = 0;
            let dense = 0;
            partRows.forEach((r, idx) => {
              const v = String(sortVal(r) ?? '');
              if (idx === 0 || v !== String(prevVal ?? '')) {
                prevVal = v;
                rank = idx + 1;
                dense += 1;
              }
              r[outName] = type === 'RANK' ? rank : dense;
            });
          } else if (type === 'LAG' || type === 'LEAD') {
            const offset = Math.max(1, Math.abs(parseInt(String(win.args?.[1] ?? '1'), 10) || 1));
            const rawDefault = win.args && win.args[2] !== undefined ? win.args[2].trim() : null;
            const defVal =
              rawDefault === null
                ? null
                : /^['"]/.test(rawDefault)
                ? rawDefault.replace(/^['"]|['"]$/g, '')
                : !isNaN(Number(rawDefault)) && rawDefault !== ''
                ? Number(rawDefault)
                : getRowValue(partRows[0], rawDefault) !== undefined
                ? getRowValue(partRows[0], rawDefault)
                : rawDefault;
            const argCol = win.aggregateArg ?? '';
            partRows.forEach((r, idx) => {
              const tgtIdx = type === 'LAG' ? idx - offset : idx + offset;
              const tgt = partRows[tgtIdx];
              r[outName] = tgt ? getRowValue(tgt, argCol) : defVal;
            });
          } else if (['SUM', 'COUNT', 'AVG', 'MIN', 'MAX'].includes(type)) {
            // Running/rolling frame: UNBOUNDED PRECEDING → CURRENT ROW.
            const argCol = win.aggregateArg ?? '';
            const countsRows = argCol === '*' || argCol === '';
            let acc = 0;
            let cnt = 0;
            let minVal: any = undefined;
            let maxVal: any = undefined;
            partRows.forEach((r, idx) => {
              if (type === 'COUNT') {
                if (countsRows) {
                  r[outName] = idx + 1;
                  return;
                }
                const v = getRowValue(r, argCol);
                if (v !== null && v !== undefined) cnt += 1;
                r[outName] = cnt;
                return;
              }
              const numeric = Number(getRowValue(r, argCol));
              const v = getRowValue(r, argCol);
              if (v !== null && v !== undefined && !isNaN(numeric)) {
                acc += numeric;
                cnt += 1;
                if (minVal === undefined || numeric < minVal) minVal = numeric;
                if (maxVal === undefined || numeric > maxVal) maxVal = numeric;
              }
              if (type === 'SUM') r[outName] = acc;
              else if (type === 'AVG') r[outName] = cnt ? acc / cnt : null;
              else if (type === 'MIN') r[outName] = minVal ?? null;
              else r[outName] = maxVal ?? null;
            });
          }
        });
      });
    }

    // 6. DISTINCT
    if (query.isDistinct) {
      const seen = new Set<string>();
      projectedRows = projectedRows.filter(row => {
        const hash = JSON.stringify(row);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
      });
    }

    // 7. ORDER BY
    if (query.orderBy && query.orderBy.length > 0) {
      projectedRows.sort((a, b) => {
        for (const ord of query.orderBy!) {
          // Sort key may be a CASE expression (ORDER BY CASE … END)
          const valA = ord.caseExpression ? this.evaluateCase(ord.caseExpression, a) : getRowValue(a, ord.column);
          const valB = ord.caseExpression ? this.evaluateCase(ord.caseExpression, b) : getRowValue(b, ord.column);
          
          if (valA === valB) continue;
          if (valA === null || valA === undefined) return ord.direction === 'ASC' ? 1 : -1;
          if (valB === null || valB === undefined) return ord.direction === 'ASC' ? -1 : 1;

          if (typeof valA === 'number' && typeof valB === 'number') {
            return ord.direction === 'ASC' ? valA - valB : valB - valA;
          }
          const cmp = String(valA).localeCompare(String(valB));
          return ord.direction === 'ASC' ? cmp : -cmp;
        }
        return 0;
      });
    }

    // 8. LIMIT & OFFSET
    if (query.offset !== undefined) {
      projectedRows = projectedRows.slice(query.offset);
    }
    if (query.limit !== undefined) {
      projectedRows = projectedRows.slice(0, query.limit);
    }

    // Determine final columns list
    if (projectedRows.length > 0) {
      finalColumns = Object.keys(projectedRows[0]);
    } else if (finalColumns.length === 0) {
      finalColumns = query.columns?.map(c => c.alias || c.expression) || [];
    }

    return {
      success: true,
      columns: finalColumns,
      rows: projectedRows,
      rowCount: projectedRows.length,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private evaluateWhere(whereExpr: string, row: TableRow): boolean {
    let trimmed = whereExpr.trim();

    while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      let depth = 0;
      let wrapsAll = true;
      for (let i = 0; i < trimmed.length - 1; i++) {
        if (trimmed[i] === '(') depth++;
        else if (trimmed[i] === ')') depth--;
        if (depth === 0) {
          wrapsAll = false;
          break;
        }
      }
      if (wrapsAll) {
        trimmed = trimmed.slice(1, -1).trim();
      } else {
        break;
      }
    }

    // Handle OR expressions
    const orParts = splitLogicalClauses(trimmed, 'OR');
    if (orParts.length > 1) {
      return orParts.some(part => this.evaluateWhere(part, row));
    }

    // Handle AND expressions
    const andParts = splitLogicalClauses(trimmed, 'AND');
    if (andParts.length > 1) {
      return andParts.every(part => this.evaluateWhere(part, row));
    }

    // Negation: NOT <expr> (e.g. `NOT (category_id = 1)`, `NOT price > 50`)
    // Evaluate the inner expression and invert the boolean result.
    if (/^NOT\s+/i.test(trimmed)) {
      const inner = trimmed.replace(/^NOT\s+/i, '').trim();
      return !this.evaluateWhere(inner, row);
    }

    // IS NULL / IS NOT NULL
    const isNullMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+IS\s+(NOT\s+)?NULL$/i);
    if (isNullMatch) {
      const col = isNullMatch[1].replace(/[`"']/g, '');
      const not = !!isNullMatch[2];
      const val = getRowValue(row, col);
      const isNull = val === null || val === undefined || val === '';
      return not ? !isNull : isNull;
    }

    // LIKE / ILIKE (e.g. name LIKE '%mouse%')
    const likeMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?(I?LIKE)\s+['"]([\s\S]*?)['"]$/i);
    if (likeMatch) {
      const col = likeMatch[1].replace(/[`"']/g, '');
      const not = !!likeMatch[2];
      const pattern = likeMatch[4];
      const val = String(getRowValue(row, col) ?? '');
      
      const regexStr = '^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$';
      const regex = new RegExp(regexStr, 'i');
      const matches = regex.test(val);
      return not ? !matches : matches;
    }

    // IN / NOT IN with literal list or subquery
    const inMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?IN\s*\(([\s\S]+?)\)$/i);
    if (inMatch) {
      const col = inMatch[1].replace(/[`"']/g, '');
      const not = !!inMatch[2];
      const inBody = inMatch[3].trim();

      // Check if subquery inside IN: (SELECT col FROM table ...)
      if (/^SELECT\b/i.test(inBody)) {
        let subquery = inBody;
        // Check for correlated subquery replacement
        subquery = subquery.replace(/p1\.category_id/g, String(getRowValue(row, 'category_id') ?? ''));
        const subRes = this.execute(subquery);
        const colName = subRes.columns[0];
        const items = subRes.rows.map(r => r[colName]);

        const val = getRowValue(row, col);
        // If items contains NULL, SQL NOT IN returns false / unknown!
        if (not && items.includes(null)) {
          return false;
        }
        const has = items.some(item => String(item ?? '').toLowerCase() === String(val ?? '').toLowerCase());
        return not ? !has : has;
      }

      const items = inBody.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      const val = String(getRowValue(row, col) ?? '');
      const has = items.some(item => item.toLowerCase() === val.toLowerCase());
      return not ? !has : has;
    }

    // BETWEEN x AND y
    const betweenMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?BETWEEN\s+([\d.]+)\s+AND\s+([\d.]+)$/i);
    if (betweenMatch) {
      const col = betweenMatch[1].replace(/[`"']/g, '');
      const not = !!betweenMatch[2];
      const min = Number(betweenMatch[3]);
      const max = Number(betweenMatch[4]);
      const val = Number(getRowValue(row, col));
      const isBetween = val >= min && val <= max;
      return not ? !isBetween : isBetween;
    }

    // Comparison operators (=, !=, <>, <=, >=, <, >) with literal or subquery.
    // Left side may be a plain column OR a function expression (LENGTH(phone), UPPER(city), …).
    const compMatch = trimmed.match(/^([A-Za-z_]+\s*\([^)]*\)|[`"']?[\w_.]+[`"']?)\s*(=|!=|<>|<=|>=|<|>)\s*([\s\S]+)$/);
    if (compMatch) {
      const rawCol = compMatch[1];
      const isFnCol = /\(/.test(rawCol);
      const col = isFnCol ? rawCol : rawCol.replace(/[`"']/g, '');
      const op = compMatch[2];
      let target = compMatch[3].trim();

      // Check if target is a subquery: (SELECT AVG(...) ...)
      if (/^\(SELECT[\s\S]+\)$/i.test(target)) {
        let subquery = target.replace(/^\(|\)$/g, '').trim();
        // Handle correlated category_id substitution if present: p2.category_id = p1.category_id
        const catVal = getRowValue(row, 'category_id');
        if (catVal !== undefined) {
          subquery = subquery.replace(/p1\.category_id/g, String(catVal));
        }
        const subRes = this.execute(subquery);
        if (subRes.success && subRes.rows.length > 0) {
          const colName = subRes.columns[0];
          target = String(subRes.rows[0][colName] ?? 0);
        }
      }

      // Check if target has CURDATE() or INTERVAL
      if (/CURDATE\(\)/i.test(target)) {
        // Anchor "today" to the simulated curriculum date (see
        // src/config/simulated-date.ts) so temporal filters match the 2026
        // seed dataset deterministically.
        const anchorDate = new Date(`${SIMULATED_TODAY}T00:00:00Z`);
        const intervalMatch = target.match(/INTERVAL\s+(\d+)\s+(DAY|MONTH|YEAR)/i);
        if (intervalMatch) {
          const num = parseInt(intervalMatch[1], 10);
          const unit = intervalMatch[2].toUpperCase();
          if (unit === 'DAY') anchorDate.setUTCDate(anchorDate.getUTCDate() - num);
          if (unit === 'MONTH') anchorDate.setUTCMonth(anchorDate.getUTCMonth() - num);
          if (unit === 'YEAR') anchorDate.setUTCFullYear(anchorDate.getUTCFullYear() - num);
        }
        target = anchorDate.toISOString().split('T')[0];
      }

      let targetVal: any = target.replace(/^['"]|['"]$/g, '').replace(/[`"']/g, '');
      if (getRowValue(row, targetVal) !== undefined && !target.startsWith("'") && !target.startsWith('"')) {
        targetVal = getRowValue(row, targetVal);
      }

      const rowVal = isFnCol
        ? this.evaluateScalar(row, rawCol)
        : (isNaN(Number(col)) || getRowValue(row, col) !== undefined ? getRowValue(row, col) : Number(col));

      const numRow = Number(rowVal);
      const numTarget = Number(targetVal);
      const isNumeric = !isNaN(numRow) && !isNaN(numTarget) && typeof rowVal !== 'string';

      const v1 = isNumeric ? numRow : String(rowVal ?? '').toLowerCase();
      const v2 = isNumeric ? numTarget : String(targetVal ?? '').toLowerCase();

      switch (op) {
        case '=': return v1 == v2;
        case '!=':
        case '<>': return v1 != v2;
        case '<': return v1 < v2;
        case '>': return v1 > v2;
        case '<=': return v1 <= v2;
        case '>=': return v1 >= v2;
      }
    }

    return true;
  }

  private computeAggregate(func: string, arg: string, rows: TableRow[]): number {
    const cleanArg = arg.trim();
    // Aggregate over a CASE expression (e.g. SUM(CASE WHEN … THEN 1 ELSE 0 END)):
    // evaluate the CASE per row, then aggregate the produced values.
    if (/^CASE\b/i.test(cleanArg)) {
      const parsedCase = parseCaseExpression(cleanArg);
      if (parsedCase) {
        const vals = rows
          .map((r) => this.evaluateCase(parsedCase, r))
          .filter((v) => v !== null && v !== undefined)
          .map((v) => Number(v))
          .filter((v) => !isNaN(v));
        if (func === 'COUNT') return vals.length;
        if (vals.length === 0) return 0;
        const sum = vals.reduce((s, v) => s + v, 0);
        if (func === 'SUM') return sum;
        if (func === 'AVG') return sum / vals.length;
        if (func === 'MIN') return Math.min(...vals);
        if (func === 'MAX') return Math.max(...vals);
      }
    }
    if (func === 'COUNT') {
      if (cleanArg === '*' || cleanArg === '1') {
        return rows.length;
      }
      if (/^DISTINCT\s+/i.test(cleanArg)) {
        const col = cleanArg.replace(/^DISTINCT\s+/i, '').trim();
        const set = new Set(rows.map(r => getRowValue(r, col)).filter(v => v !== null && v !== undefined));
        return set.size;
      }
      return rows.filter(r => {
        const val = getRowValue(r, cleanArg);
        return val !== null && val !== undefined;
      }).length;
    }

    const values = rows.map(r => {
      if (cleanArg.includes('*')) {
        const [c1, c2] = cleanArg.split('*').map(s => s.trim());
        const v1 = Number(getRowValue(r, c1)) || 0;
        const v2 = Number(getRowValue(r, c2)) || 0;
        return v1 * v2;
      }
      return Number(getRowValue(r, cleanArg));
    }).filter(v => !isNaN(v));

    if (values.length === 0) return 0;

    if (func === 'SUM') {
      return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
    }
    if (func === 'AVG') {
      return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
    }
    if (func === 'MIN') {
      return Math.min(...values);
    }
    if (func === 'MAX') {
      return Math.max(...values);
    }
    return 0;
  }

  private executeInsert(query: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const table = query.insertTable?.toLowerCase();
    if (!table || !this.db.tables[table]) {
      throw new Error(`Table '${query.insertTable}' does not exist.`);
    }

    const rowsToInsert =
      query.insertValuesList && query.insertValuesList.length > 0
        ? query.insertValuesList
        : [query.insertValues];

    const meta = this.tableMeta[table];
    const existing = this.db.tables[table];

    // Phase 1 — resolve each tuple into a clean row: AUTO_INCREMENT ids are
    // assigned in sequence, and DEFAULT values fill missing columns.
    let autoSeq = existing.reduce((m, r: any) => {
      if (!meta?.autoIncrementCol) return m;
      const v = Number(r[meta.autoIncrementCol]);
      return !isNaN(v) && v > m ? v : m;
    }, 0);
    const resolved: TableRow[] = rowsToInsert.map((values) => {
      let row: TableRow = { ...(values || {}) };
      if (meta) {
        if (
          meta.autoIncrementCol &&
          (row[meta.autoIncrementCol] === undefined ||
            row[meta.autoIncrementCol] === null ||
            row[meta.autoIncrementCol] === '')
        ) {
          autoSeq += 1;
          row[meta.autoIncrementCol] = autoSeq;
        }
        for (const [col, dflt] of Object.entries(meta.defaults)) {
          if (row[col] === undefined) row[col] = dflt;
        }
      }
      return row;
    });

    // Phase 2 — validate EVERY row before touching the table. A multi-row
    // INSERT is all-or-nothing: if any tuple violates NOT NULL / UNIQUE /
    // CHECK / FK, no rows are inserted.
    const seenUniques: Record<string, Set<any>> = {};
    for (const row of resolved) {
      if (table === 'products' && row.category_id) {
        const catExists = this.db.tables.categories.some((c: any) => c.category_id === row.category_id);
        if (!catExists) {
          throw new Error(`Cannot add or update child row: a foreign key constraint fails (category_id ${row.category_id} not found in categories).`);
        }
      }
      if (!meta) continue;
      for (const col of meta.notNull) {
        if (row[col] === undefined || row[col] === null) {
          throw new Error(`Column '${col}' cannot be null (NOT NULL constraint).`);
        }
      }
      for (const col of meta.uniques) {
        if (row[col] !== undefined && row[col] !== null) {
          const seenVals = seenUniques[col] || new Set(existing.map((r: any) => r[col]));
          seenUniques[col] = seenVals;
          if (seenVals.has(row[col])) {
            throw new Error(`Duplicate entry '${row[col]}' for UNIQUE column '${col}'.`);
          }
          seenVals.add(row[col]);
        }
      }
      for (const chk of meta.checks) {
        const ok = this.evaluateWhere(chk.expr, row);
        if (!ok) {
          throw new Error(`CHECK constraint violated: ${chk.expr}`);
        }
      }
      for (const fk of meta.fks) {
        if (row[fk.col] !== undefined && row[fk.col] !== null) {
          const refT = this.db.tables[fk.refTable];
          const found = refT && refT.some((r: any) => r[fk.refCol] === row[fk.col]);
          if (!found) {
            throw new Error(`Cannot add or update a child row: a foreign key constraint fails (${fk.col} ${row[fk.col]} → ${fk.refTable}.${fk.refCol}).`);
          }
        }
      }
    }

    for (const row of resolved) {
      this.db.tables[table].push(row);
    }

    const inserted = rowsToInsert.length;
    return {
      success: true,
      columns: ['status', 'affected_rows'],
      rows: [{ status: `Inserted ${inserted} row(s) successfully`, affected_rows: inserted }],
      rowCount: 1,
      affectedRows: inserted,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private executeUpdate(query: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const table = query.updateTable?.toLowerCase();
    if (!table || !this.db.tables[table]) {
      throw new Error(`Table '${query.updateTable}' does not exist.`);
    }

    let affected = 0;
    this.db.tables[table] = this.db.tables[table].map(row => {
      if (!query.whereClause || this.evaluateWhere(query.whereClause, row)) {
        affected++;
        // v2 DML fix: evaluate each SET value against the CURRENT row, so
        // expressions like `price * 1.10`, `quantity_in_stock + 20` compute
        // properly instead of being stored as the raw string.
        const updates: Record<string, any> = {};
        for (const [col, val] of Object.entries(query.updateSet ?? {})) {
          updates[col] = this.evaluateSetValue(String(val), row);
        }
        return { ...row, ...updates };
      }
      return row;
    });

    return {
      success: true,
      columns: ['status', 'affected_rows'],
      rows: [{ status: `Updated ${affected} row(s)`, affected_rows: affected }],
      rowCount: 1,
      affectedRows: affected,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  /**
   * Evaluate a SET clause value. Handles:
   *   - bare numeric/string literals (returned as-is)
   *   - arithmetic expressions referencing the row (`price * 1.10`,
   *     `quantity_in_stock + 20`, `price + tax * 0.5`, ...) → computed number
   *   - a plain column reference / comparison that evaluates via evaluateWhere
   *     → its computed value (numeric if the comparison is numeric)
   * Degrades gracefully to the raw string when nothing matches.
   */
  private evaluateSetValue(rawValue: string, row: TableRow): any {
    const v = String(rawValue ?? '').trim();
    if (v === '') return rawValue;

    // Bare quoted string → unquote.
    if (/^['"].*['"]$/.test(v)) return v.replace(/^['"]|['"]$/g, '');

    // Pure numeric literal → number.
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);

    // Arithmetic expression → compute against the row.
    if (/[+\-*/%]/.test(v) && !/^[=!<>]/.test(v)) {
      // Replace column references with current row values (null → keep name
      // so a friendly error surfaces rather than NaN).
      let expr = v;
      expr = expr.replace(/[`"']?([a-zA-Z_][a-zA-Z0-9_]*)[`"']?/g, (tok, col: string) => {
        const lower = col.toLowerCase();
        if (['null', 'true', 'false', 'and', 'or', 'not'].includes(lower)) return tok;
        const val = getRowValue(row, col);
        if (typeof val === 'number') return String(val);
        if (typeof val === 'string' && !isNaN(Number(val))) return String(Number(val));
        // Unknown identifier → keep as-is (will produce NaN → we throw below).
        return tok;
      });
      // Safety: only allow digits, operators, parens, dots (no injection).
      if (!/^[\d\.\+\-\*\/%\s()]+$/.test(expr)) {
        // Fall back to treating it as a comparison value.
        return this.booleanToValue(this.evaluateWhere(v, row), v, row);
      }
      try {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${expr});`)();
        if (typeof result === 'number' && !isNaN(result)) return result;
      } catch {
        /* fall through to raw */
      }
      return rawValue;
    }

    // Plain value: try the comparison evaluator (handles e.g. `category_id`)
    // to resolve a column reference to the row's value.
    return this.booleanToValue(this.evaluateWhere(v, row), v, row);
  }

  /** For `SET x = <col-ref>` produce the actual column value, not a boolean. */
  private booleanToValue(result: boolean, raw: string, row: TableRow): any {
    // If the expression is a plain identifier, resolve it directly.
    const ident = raw.trim();
    if (/^[`"\']?[a-zA-Z_][a-zA-Z0-9_]*[`"\']?$/.test(ident)) {
      return getRowValue(row, ident.replace(/[`"\']/g, ''));
    }
    // Evaluate the comparison: if it yielded a numeric comparison, return the
    // matched value clamped to the comparison (e.g. `SET x = price < 50`
    // returns a boolean per SQL), otherwise fall back to the raw value.
    return result === true ? true : raw;
  }

  private executeDelete(query: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const table = query.deleteTable?.toLowerCase();
    if (!table || !this.db.tables[table]) {
      throw new Error(`Table '${query.deleteTable}' does not exist.`);
    }

    const initialLen = this.db.tables[table].length;
    this.db.tables[table] = this.db.tables[table].filter(row => {
      if (!query.whereClause) return false;
      return !this.evaluateWhere(query.whereClause, row);
    });

    const affected = initialLen - this.db.tables[table].length;

    return {
      success: true,
      columns: ['status', 'affected_rows'],
      rows: [{ status: `Deleted ${affected} row(s)`, affected_rows: affected }],
      rowCount: 1,
      affectedRows: affected,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }
}
