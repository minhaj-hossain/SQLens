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

export interface DatabaseState {
  tables: Record<string, TableRow[]>;
  schemas: Record<string, TableSchema>;
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
}
