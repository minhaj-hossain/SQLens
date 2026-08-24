import { DatabaseState, QueryExecutionResult, TableRow } from '../../types/database';
import { parseSql, ParsedSqlQuery } from './parser';
import { INITIAL_TABLES } from '../../content/database/tables';
import { DATABASE_SCHEMAS } from '../../content/database/schema';

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

    // 1. FROM clause - load base rows
    let currentRows: TableRow[] = this.db.tables[tableName].map(r => ({ ...r }));

    // 2. JOINs
    if (query.joins && query.joins.length > 0) {
      for (const join of query.joins) {
        const joinTable = join.table.toLowerCase();
        const targetData = this.db.tables[joinTable];
        if (!targetData) {
          throw new Error(`Table '${join.table}' in JOIN clause does not exist.`);
        }

        const newRows: TableRow[] = [];
        const leftKey = join.onLeft.includes('.') ? join.onLeft.split('.')[1] : join.onLeft;
        const rightKey = join.onRight.includes('.') ? join.onRight.split('.')[1] : join.onRight;

        for (const row of currentRows) {
          let matched = false;
          for (const targetRow of targetData) {
            if (row[leftKey] !== undefined && targetRow[rightKey] !== undefined && row[leftKey] == targetRow[rightKey]) {
              newRows.push({ ...row, ...targetRow });
              matched = true;
            } else if (row[rightKey] !== undefined && targetRow[leftKey] !== undefined && row[rightKey] == targetRow[leftKey]) {
              newRows.push({ ...row, ...targetRow });
              matched = true;
            }
          }
          if (!matched && join.type === 'LEFT') {
            // Null out joined columns
            const nullTarget: Record<string, any> = {};
            const schema = this.db.schemas[joinTable];
            if (schema) {
              schema.columns.forEach(col => { nullTarget[col.name] = null; });
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
          const key = query.groupBy!.map(col => String(row[col] ?? '')).join('___');
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
          const colName = col.alias || col.expression;
          if (col.aggregate) {
            projected[colName] = this.computeAggregate(col.aggregate, col.aggregateArg || '', groupRows);
          } else {
            // Take first row value for grouped columns
            projected[colName] = groupRows[0] ? groupRows[0][col.expression] : null;
          }
        });

        // HAVING filter check
        if (query.havingClause) {
          if (this.evaluateWhere(query.havingClause, projected)) {
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
            const outputCol = col.alias || col.expression;
            const srcCol = col.expression.includes('.') ? col.expression.split('.')[1] : col.expression;
            
            // Check computed expressions (e.g., quantity * unit_price)
            if (srcCol.includes('*')) {
              const [c1, c2] = srcCol.split('*').map(s => s.trim());
              projected[outputCol] = (Number(row[c1]) || 0) * (Number(row[c2]) || 0);
            } else {
              projected[outputCol] = row[srcCol] !== undefined ? row[srcCol] : null;
            }
          });
          return projected;
        });
      }
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
          const valA = a[ord.column] ?? a[ord.column.toLowerCase()];
          const valB = b[ord.column] ?? b[ord.column.toLowerCase()];
          
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

    // 8. OFFSET & LIMIT
    const offset = query.offset || 0;
    if (offset > 0) {
      projectedRows = projectedRows.slice(offset);
    }
    if (query.limit !== undefined && query.limit >= 0) {
      projectedRows = projectedRows.slice(0, query.limit);
    }

    if (finalColumns.length === 0) {
      if (projectedRows.length > 0) {
        finalColumns = Object.keys(projectedRows[0]);
      } else if (query.columns && !query.columns.some(c => c.expression === '*')) {
        finalColumns = query.columns.map(c => c.alias || c.expression);
      } else {
        const schema = this.db.schemas[tableName];
        finalColumns = schema ? schema.columns.map(c => c.name) : [];
      }
    }

    return {
      success: true,
      columns: finalColumns,
      rows: projectedRows,
      rowCount: projectedRows.length,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }

  private evaluateWhere(whereStr: string, row: TableRow): boolean {
    const clause = whereStr.trim();
    if (!clause) return true;

    // Handle OR expressions
    if (/\bOR\b/i.test(clause) && !clause.includes('(')) {
      const parts = clause.split(/\bOR\b/i);
      return parts.some(p => this.evaluateSimplePredicate(p.trim(), row));
    }

    // Handle AND expressions
    const andParts = clause.split(/\bAND\b/i);
    return andParts.every(p => this.evaluateSimplePredicate(p.trim(), row));
  }

  private evaluateSimplePredicate(pred: string, row: TableRow): boolean {
    const trimmed = pred.trim();
    if (!trimmed) return true;

    // IS NULL / IS NOT NULL
    const isNullMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+IS\s+(NOT\s+)?NULL$/i);
    if (isNullMatch) {
      const rawCol = isNullMatch[1].replace(/[`"']/g, '');
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const val = row[col];
      const isNull = val === null || val === undefined;
      return isNullMatch[2] ? !isNull : isNull;
    }

    // LIKE
    const likeMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?LIKE\s+['"]([\s\S]+?)['"]$/i);
    if (likeMatch) {
      const rawCol = likeMatch[1].replace(/[`"']/g, '');
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const not = !!likeMatch[2];
      const pattern = likeMatch[3];
      const val = String(row[col] || '');
      const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
      const matches = regex.test(val);
      return not ? !matches : matches;
    }

    // IN (...)
    const inMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?IN\s*\(([\s\S]+?)\)$/i);
    if (inMatch) {
      const rawCol = inMatch[1].replace(/[`"']/g, '');
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const not = !!inMatch[2];
      const items = inMatch[3].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      const val = String(row[col] ?? '');
      const has = items.some(item => item.toLowerCase() === val.toLowerCase());
      return not ? !has : has;
    }

    // BETWEEN x AND y
    const betweenMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?BETWEEN\s+([\d.]+)\s+AND\s+([\d.]+)$/i);
    if (betweenMatch) {
      const rawCol = betweenMatch[1].replace(/[`"']/g, '');
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const not = !!betweenMatch[2];
      const min = Number(betweenMatch[3]);
      const max = Number(betweenMatch[4]);
      const val = Number(row[col]);
      const isBetween = val >= min && val <= max;
      return not ? !isBetween : isBetween;
    }

    // Comparison operators (=, !=, <>, <=, >=, <, >)
    const compMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s*(=|!=|<>|<=|>=|<|>)\s*([\s\S]+)$/);
    if (compMatch) {
      const rawCol = compMatch[1].replace(/[`"']/g, '');
      const col = rawCol.includes('.') ? rawCol.split('.')[1] : rawCol;
      const op = compMatch[2];
      let target = compMatch[3].trim();

      // Check if target is another column name
      let targetVal: any = target.replace(/^['"]|['"]$/g, '').replace(/[`"']/g, '');
      if (row[targetVal] !== undefined && !target.startsWith("'") && !target.startsWith('"')) {
        targetVal = row[targetVal];
      }

      const rowVal = row[col];

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
        const set = new Set(rows.map(r => r[col]).filter(v => v !== null && v !== undefined));
        return set.size;
      }
      return rows.filter(r => r[cleanArg] !== null && r[cleanArg] !== undefined).length;
    }

    const values = rows.map(r => Number(r[cleanArg])).filter(v => !isNaN(v));
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

    // Check FK constraint
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

    // Check FK violation for Day 17 practice: deleting a supplier referenced by products!
    if (table === 'suppliers') {
      const toDelete = this.db.tables.suppliers.filter(row => !query.whereClause || this.evaluateWhere(query.whereClause, row));
      for (const sup of toDelete) {
        const hasProducts = this.db.tables.products.some(p => p.supplier_id === sup.supplier_id);
        if (hasProducts) {
          throw new Error(`ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (\`products\`, CONSTRAINT \`products_ibfk_2\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\` (\`supplier_id\`)).`);
        }
      }
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
