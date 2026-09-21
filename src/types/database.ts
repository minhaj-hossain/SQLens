export type SQLDataType = 'number' | 'string' | 'date' | 'boolean' | 'decimal';

export interface ColumnDefinition {
  name: string;
  type: SQLDataType;
  primaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  nullable?: boolean;
  defaultValue?: string | number;
  description?: string;
}

export interface TableSchema {
  name: string;
  displayName: string;
  description: string;
  columns: ColumnDefinition[];
}

export type TableRow = Record<string, any>;

/**
 * Constraint metadata discovered from a runtime `CREATE TABLE` statement
 * (AUTO_INCREMENT, DEFAULT, NOT NULL, UNIQUE, CHECK, FOREIGN KEY). Seeded tables
 * have NO meta — constraints are only enforced on tables learners build with DDL.
 *
 * Phase 3 fix: this is part of the DATABASE STATE, not just executor-local state.
 * Grading snapshots the DB (`getDatabaseState()`) and replays the reference
 * solution in a sandbox (`new SqlExecutor(preState)`). While this metadata lived
 * only on the instance, the sandbox could not reproduce AUTO_INCREMENT/DEFAULT
 * columns, so a CORRECT multi-step DDL task was graded against rows missing their
 * generated ids (identical row counts, different values) and could never pass.
 */
export interface DdlTableMeta {
  autoIncrementCol?: string;
  notNull: string[];
  uniques: string[];
  defaults: Record<string, any>;
  checks: { expr: string }[];
  fks: { col: string; refTable: string; refCol: string }[];
}

/**
 * Index registry entry. `name` is the user-visible index name, `table`+`column`
 * are lowercase. Seeded from each schema's PRIMARY KEY, extended by CREATE INDEX
 * and shrunk by DROP INDEX.
 *
 * Like `DdlTableMeta`, this belongs to the state: a sandbox replaying a
 * `DROP INDEX` reference solution must see the indexes the learner created
 * (otherwise the reference solution errors and the task is ungradeable).
 */
export interface SqlIndexDef {
  name: string;
  table: string;
  column: string;
  unique?: boolean;
}

export type TxnStatus = 'none' | 'open' | 'failed';

export interface DatabaseState {
  tables: Record<string, TableRow[]>;
  schemas: Record<string, TableSchema>;
  /**
   * Per-table runtime DDL metadata, keyed by lowercase table name. Absent/`{}`
   * for a pure-seed state. Optional so hand-built literals (`{ tables, schemas }`)
   * keep type-checking.
   */
  meta?: Record<string, DdlTableMeta>;
  /**
   * Runtime index registry, keyed by `primary:<table>` / `index:<name>`.
   * Optional for the same reason as `meta`; when absent the executor reseeds it
   * from the schemas' PRIMARY KEYs.
   */
  indexes?: Record<string, SqlIndexDef>;
  /**
   * Runtime view registry, keyed by lowercase view name.
   * Stores the view's defined SELECT query and options (e.g. checkOption).
   */
  views?: Record<string, { name: string; query: string; checkOption?: boolean; isUpdatable?: boolean }>;
  /**
   * Stored procedures / functions registry, keyed by lowercase routine name.
   */
  routines?: Record<string, { name: string; type: 'FUNCTION' | 'PROCEDURE'; params: string[]; body: string; returnType?: string }>;
  /**
   * Trigger registry, keyed by lowercase trigger name.
   */
  triggers?: Record<string, { name: string; timing: 'BEFORE' | 'AFTER'; event: 'INSERT' | 'UPDATE' | 'DELETE'; table: string; body: string }>;
  /**
   * Active savepoint snapshots for partial rollback.
   */
  savepoints?: Record<string, DatabaseState>;
}

export interface QueryExecutionResult {
  success: boolean;
  columns: string[];
  rows: TableRow[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  affectedRows?: number;
  transactionStatus?: 'in_transaction' | 'committed' | 'rolled_back' | 'none';
  /**
   * Batch A (real transaction state machine): session-level transaction state
   * AFTER this statement. `'open'` = BEGIN seen, writes uncommitted;
   * `'failed'` = statement errored inside a txn (Postgres: must ROLLBACK);
   * `'none'` = no open transaction.
   */
  txnStatus?: TxnStatus;
  /**
   * Writes applied by this statement that are NOT yet durable (uncommitted).
   * Drives the dirty banner + the "commit before checking" submit gate.
   */
  uncommittedChanges?: number;
}
