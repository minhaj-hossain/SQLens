import { DatabaseState, QueryExecutionResult, TableRow } from '../../types/database';
import { parseSql, ParsedSqlQuery } from './parser';
import { INITIAL_TABLES } from '../../content/database/tables';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

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

export class SqlExecutor {
  private db: DatabaseState;
  private transactionBackup: DatabaseState | null = null;
  private inTransaction: boolean = false;

  constructor(initialDb?: DatabaseState) {
    if (initialDb) {
      this.db = JSON.parse(JSON.stringify(initialDb));
    } else {
      this.db = {
        tables: JSON.parse(JSON.stringify(INITIAL_TABLES)),
        schemas: DATABASE_SCHEMAS,
      };
    }
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
        schemas: DATABASE_SCHEMAS,
      };
    }
    this.transactionBackup = null;
    this.inTransaction = false;
  }

  public executeQuery(sql: string): QueryExecutionResult {
    return this.execute(sql);
  }

  public execute(sql: string): QueryExecutionResult {
    const startTime = performance.now();
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

  private executeCte(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const cteName = parsed.cteName?.toLowerCase();
    const cteSql = parsed.cteQuery;
    const mainSql = parsed.mainQuery;

    if (!cteName || !cteSql || !mainSql) {
      throw new Error('Invalid Common Table Expression syntax');
    }

    // Execute inner CTE query
    const cteRes = this.execute(cteSql);
    if (!cteRes.success) {
      throw new Error(`Error executing CTE '${parsed.cteName}': ${cteRes.error}`);
    }

    // Register temporary table
    const hadTableBefore = !!this.db.tables[cteName];
    const prevTableData = this.db.tables[cteName];
    this.db.tables[cteName] = cteRes.rows;

    try {
      const mainRes = this.execute(mainSql);
      mainRes.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return mainRes;
    } finally {
      if (hadTableBefore) {
        this.db.tables[cteName] = prevTableData;
      } else {
        delete this.db.tables[cteName];
      }
    }
  }

  private executeExplain(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const target = parsed.explainTarget || '';
    const parsedTarget = parseSql(target);
    const targetTable = parsedTarget.fromTable || 'products';

    const columns = ['id', 'select_type', 'table', 'type', 'possible_keys', 'key', 'rows', 'Extra'];
    const rows = [
      {
        id: 1,
        select_type: 'SIMPLE',
        table: targetTable,
        type: parsedTarget.whereClause ? 'ref' : 'ALL',
        possible_keys: parsedTarget.whereClause ? 'PRIMARY, idx_lookup' : null,
        key: parsedTarget.whereClause ? 'idx_lookup' : null,
        rows: this.db.tables[targetTable.toLowerCase()]?.length || 10,
        Extra: parsedTarget.whereClause ? 'Using index condition; Using where' : '',
      },
    ];

    return {
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private executeDdl(parsed: ParsedSqlQuery, startTime: number): QueryExecutionResult {
    const cmd = parsed.ddlCommand || '';

    // CREATE TABLE
    const createMatch = cmd.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"']?[\w_]+[`"']?)/i);
    if (createMatch) {
      const tbl = createMatch[1].replace(/[`"']/g, '').toLowerCase();
      if (!this.db.tables[tbl]) {
        this.db.tables[tbl] = [];
      }
      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Table '${tbl}' created successfully (0 rows affected)` }],
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

      return {
        success: true,
        columns: ['status'],
        rows: [{ status: `Table '${tbl}' altered: column '${colName}' added successfully` }],
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
    if (!tableName || !this.db.tables[tableName]) {
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

        const newRows: TableRow[] = [];
        const leftKey = join.onLeft;
        const rightKey = join.onRight;

        for (const row of currentRows) {
          let matched = false;
          for (const targetRow of targetData) {
            const vLeft = getRowValue(row, leftKey);
            const vRight = getRowValue(targetRow, rightKey);
            const vLeftAlt = getRowValue(row, rightKey);
            const vRightAlt = getRowValue(targetRow, leftKey);

            if ((vLeft !== undefined && vRight !== undefined && vLeft == vRight) ||
                (vLeftAlt !== undefined && vRightAlt !== undefined && vLeftAlt == vRightAlt)) {
              const merged: TableRow = { ...row };
              Object.keys(targetRow).forEach(k => {
                merged[`${joinTable}.${k}`] = targetRow[k];
                if (joinAlias) merged[`${joinAlias}.${k}`] = targetRow[k];
                if (merged[k] === undefined) merged[k] = targetRow[k];
              });
              newRows.push(merged);
              matched = true;
            }
          }
          if (!matched && join.type === 'LEFT') {
            const nullTarget: Record<string, any> = {};
            const schema = this.db.schemas[joinTable];
            if (schema) {
              schema.columns.forEach(col => {
                nullTarget[col.name] = null;
                nullTarget[`${joinTable}.${col.name}`] = null;
                if (joinAlias) nullTarget[`${joinAlias}.${col.name}`] = null;
              });
            } else if (targetData.length > 0) {
              Object.keys(targetData[0]).forEach(k => {
                nullTarget[k] = null;
                nullTarget[`${joinTable}.${k}`] = null;
                if (joinAlias) nullTarget[`${joinAlias}.${k}`] = null;
              });
            }
            newRows.push({ ...row, ...nullTarget });
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
          const key = query.groupBy!.map(col => String(getRowValue(row, col) ?? '')).join('___');
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
          if (col.aggregate) {
            projected[colName] = this.computeAggregate(col.aggregate, col.aggregateArg || '', groupRows);
          } else {
            // Take first row value for grouped columns
            projected[colName] = groupRows[0] ? getRowValue(groupRows[0], col.expression) : null;
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
            
            // Check computed expressions (e.g., quantity * unit_price)
            if (srcCol.includes('*')) {
              const [c1, c2] = srcCol.split('*').map(s => s.trim());
              const val1 = Number(getRowValue(row, c1)) || 0;
              const val2 = Number(getRowValue(row, c2)) || 0;
              projected[outputCol] = val1 * val2;
            } else if (!col.windowFunction) {
              projected[outputCol] = getRowValue(row, srcCol) !== undefined ? getRowValue(row, srcCol) : null;
            }
          });
          return projected;
        });
      }
    }

    // Window Functions (e.g. ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...))
    const windowCols = query.columns?.filter(c => !!c.windowFunction);
    if (windowCols && windowCols.length > 0) {
      windowCols.forEach(winCol => {
        const win = winCol.windowFunction!;
        const partKey = win.partitionBy;
        const orderKey = win.orderBy;
        const outName = winCol.alias || winCol.expression;

        // Group rows by partition
        const partitions: Record<string, TableRow[]> = {};
        projectedRows.forEach(r => {
          const pk = partKey ? String(getRowValue(r, partKey) ?? '') : 'all';
          if (!partitions[pk]) partitions[pk] = [];
          partitions[pk].push(r);
        });

        // Compute rank within each partition
        Object.values(partitions).forEach(partRows => {
          if (orderKey) {
            partRows.sort((a, b) => {
              const va = Number(getRowValue(a, orderKey)) || 0;
              const vb = Number(getRowValue(b, orderKey)) || 0;
              return win.direction === 'ASC' ? va - vb : vb - va;
            });
          }
          partRows.forEach((r, idx) => {
            r[outName] = idx + 1;
          });
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
          const valA = getRowValue(a, ord.column);
          const valB = getRowValue(b, ord.column);
          
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

    // Comparison operators (=, !=, <>, <=, >=, <, >) with literal or subquery
    const compMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s*(=|!=|<>|<=|>=|<|>)\s*([\s\S]+)$/);
    if (compMatch) {
      const col = compMatch[1].replace(/[`"']/g, '');
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
        // Anchor CURDATE to '2024-03-01' matching seed dataset
        const anchorDate = new Date('2024-03-01T00:00:00Z');
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

      const rowVal = isNaN(Number(col)) || getRowValue(row, col) !== undefined ? getRowValue(row, col) : Number(col);

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

    if (table === 'products' && query.insertValues?.category_id) {
      const catExists = this.db.tables.categories.some(c => c.category_id === query.insertValues?.category_id);
      if (!catExists) {
        throw new Error(`Cannot add or update child row: a foreign key constraint fails (category_id ${query.insertValues.category_id} not found in categories).`);
      }
    }

    this.db.tables[table].push({ ...query.insertValues });

    return {
      success: true,
      columns: ['status', 'affected_rows'],
      rows: [{ status: 'Row inserted successfully', affected_rows: 1 }],
      rowCount: 1,
      affectedRows: 1,
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
        return { ...row, ...query.updateSet };
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
