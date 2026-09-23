/**
 * sql-keywords — the canonical SQL vocabulary for every UI surface
 * (Workstream C — DDL audit follow-up).
 *
 * Single source of truth consumed by:
 *  - `highlight-sql.ts`  grayscale tokenizer ( lesson pages + the real editor
 *                         overlay ); re-exports SQL_KEYWORDS for existing
 *                         importers (format-sql, autocomplete, editor-errors);
 *  - `autocomplete.ts`   GLOBAL_POOL reachability + the DDL types/constraints
 *                         pools (ddl-columns / ddl-modifier contexts);
 *  - `editor-errors.ts`  syntax "did you mean" candidates (incl. type typos).
 *
 * Contract: `SQL_DATA_TYPES` MUST stay set-equal to the engine type registry
 * (`sql-engine/sql-type-registry.ts` → SQL_TYPE_KINDS). Adding a type on one
 * side only fails `tests/ui/sql-keywords.test.ts` (drift guard) — amend both
 * together (same rule as the DIALECT §5 table).
 *
 * Only DIALECT-blessed, engine-executable vocabulary belongs here:
 * CASCADE / RESTRICT / GRANT / REVOKE are deliberately absent (unsupported —
 * Workstream D decides their fate; see docs/DIALECT.md §5).
 */

/** Data types — curated in Day-27 teaching order (the six taught first). */
export const SQL_DATA_TYPES = [
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'MEDIUMINT', 'SERIAL', 'BIGSERIAL',
  'VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'ENUM', 'JSON',
  'DECIMAL', 'DEC', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
  'BOOLEAN', 'BOOL',
];

/** DDL idempotence/clarity modifiers — all engine-executable:
 *  CREATE TABLE IF [NOT] EXISTS, DROP TABLE IF EXISTS, CREATE OR REPLACE VIEW,
 *  and named/unnamed CONSTRAINT clauses. */
export const SQL_DDL_MODIFIERS = ['IF NOT EXISTS', 'IF EXISTS', 'OR REPLACE', 'CONSTRAINT'];

export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL', 'NOT IN',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE',
  'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
  'ALTER TABLE', 'CROSS JOIN', 'INTERSECT', 'EXCEPT', 'NULL', 'WITH',
  // Scalar string functions
  'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'CONCAT', 'SUBSTRING',
  // Date functions
  'YEAR', 'MONTH', 'DAY', 'EXTRACT', 'DATEDIFF', 'CURDATE', 'INTERVAL',
  // Window functions
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'PARTITION BY', 'OVER',
  // DDL constraints / keywords
  'CREATE INDEX', 'DROP INDEX', 'ADD COLUMN', 'DROP COLUMN', 'PRIMARY KEY', 'FOREIGN KEY',
  'REFERENCES', 'NOT NULL', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'CHECK',
  // Transactions
  'BEGIN', 'COMMIT', 'ROLLBACK', 'START TRANSACTION', 'SAVEPOINT', 'ROLLBACK TO SAVEPOINT',
  // Existence / idempotence / boolean predicates (taught — C gap fill)
  'EXISTS', 'NOT EXISTS',
  'IS TRUE', 'IS FALSE', 'IS NOT TRUE', 'IS NOT FALSE',
  // Views & routines (Days 39-47 — engine-executable)
  'CREATE OR REPLACE VIEW', 'CREATE VIEW', 'DROP VIEW',
  'CREATE TRIGGER', 'DROP TRIGGER', 'CREATE FUNCTION', 'DROP FUNCTION',
  'CREATE PROCEDURE', 'DROP PROCEDURE', 'CALL', 'WITH RECURSIVE',
  // Other
  'EXPLAIN', 'TRUE', 'FALSE',
  // Data types (Workstream B registry parity — drift-guarded by tests)
  ...SQL_DATA_TYPES,
  // DDL modifiers
  ...SQL_DDL_MODIFIERS,
];