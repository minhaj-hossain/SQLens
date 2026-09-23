import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import { QueryExecutionResult } from '../../src/types/database';
import { ValidationRule } from '../../src/types/curriculum';
import { Day_29_MODULE } from '../../src/content/modules/day-29-ddl-schema-evolution';

/**
 * Workstream D — DDL is honest end to end:
 *  - unsupported forms fail with NAMED errors quoting docs/DIALECT.md §5
 *    (the old fall-through reported success while executing nothing);
 *  - privilege/principal statements keep succeeding as LABELED simulations
 *    (Day-55 content executes them — §8);
 *  - plain DROP of a missing table errors like real SQL (Day 29's lesson);
 *  - `requireIfExists` grades the teardown TEXT behind sandbox leniency.
 */
describe('named DDL errors & simulations (Workstream D)', () => {
  const ex = (): SqlExecutor => {
    const e = new SqlExecutor();
    e.allowDdlOverwrite = true;
    return e;
  };

  it('TRUNCATE fails with a named error pointing at DELETE FROM', () => {
    const r = ex().executeQuery('TRUNCATE TABLE products;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/TRUNCATE is not supported/);
    expect(String(r.error)).toMatch(/DELETE FROM/);
    expect(String(r.error)).toMatch(/DIALECT\.md §5/);
  });

  it('RENAME TABLE fails with a named error', () => {
    const r = ex().executeQuery('RENAME TABLE old_t TO new_t;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/RENAME TABLE is not supported/);
  });

  it('ALTER ... DROP COLUMN / RENAME / MODIFY / CONSTRAINT each get named errors', () => {
    const drop = ex().executeQuery('ALTER TABLE products DROP COLUMN reorder_level;');
    expect(String(drop.error)).toMatch(/ALTER \.\.\. DROP COLUMN is not supported/);
    expect(String(drop.error)).toMatch(/ADD COLUMN/);
    const rename = ex().executeQuery('ALTER TABLE products RENAME TO catalog;');
    expect(String(rename.error)).toMatch(/ALTER \.\.\. RENAME is not supported/);
    const modify = ex().executeQuery('ALTER TABLE products MODIFY price DECIMAL(8,2);');
    expect(String(modify.error)).toMatch(/MODIFY\/CHANGE COLUMN is not supported/);
    const constraint = ex().executeQuery('ALTER TABLE products ADD CONSTRAINT chk_price CHECK (price > 0);');
    expect(String(constraint.error)).toMatch(/ALTER \.\.\. CONSTRAINT is not supported/);
    expect(String(constraint.error)).toMatch(/Declare constraints inside CREATE TABLE/);
  });

  it('a second ALTER clause is rejected instead of silently ignored (and mutates nothing)', () => {
    const e = ex();
    const r = e.executeQuery(
      'ALTER TABLE products ADD COLUMN tagline VARCHAR(120), DROP COLUMN reorder_level;',
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/ONE clause per ALTER TABLE/);
    const cols = e.getDatabaseState().schemas['products'].columns.map((c) => c.name);
    expect(cols).not.toContain('tagline'); // guard runs before any mutation
    expect(cols).toContain('reorder_level'); // the DROP never happened
  });

  it('plain DROP of a MISSING table errors; IF EXISTS keeps the no-op', () => {
    const e = ex();
    const plain = e.executeQuery('DROP TABLE nope_t;');
    expect(plain.success).toBe(false);
    expect(String(plain.error)).toMatch(/doesn't exist/);
    expect(String(plain.error)).toMatch(/DROP TABLE IF EXISTS nope_t/);
    const ifExists = e.executeQuery('DROP TABLE IF EXISTS nope_t;');
    expect(ifExists.success).toBe(true);
    expect(ifExists.rows[0]?.status).toMatch(/no-op/);
  });

  it('DROP TABLE a, b drops nothing (one table per statement)', () => {
    const e = ex();
    const r = e.executeQuery('DROP TABLE products, customers;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/ONE table per statement/);
    expect(e.getDatabaseState().tables['products']).toBeDefined(); // untouched

  });

  it('column-level REFERENCES fails with the table-level guidance', () => {
    const r = ex().executeQuery(
      'CREATE TABLE t_colref (id INT, ref INT REFERENCES products(product_id));',
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Column-level REFERENCES is not supported/);
    expect(String(r.error)).toMatch(/FOREIGN KEY \(ref\) REFERENCES/);
  });

  it('FK ON DELETE action fails instead of being silently dropped (no table created)', () => {
    const e = ex();
    const r = e.executeQuery(
      'CREATE TABLE t_fkact (id INT, ref INT, FOREIGN KEY (ref) REFERENCES products(product_id) ON DELETE CASCADE);',
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/ON DELETE \/ ON UPDATE actions on FOREIGN KEY are not supported/);
    expect(e.executeQuery('SELECT * FROM t_fkact;').success).toBe(false); // nothing half-created
  });

  it('a named CONSTRAINT clause inside CREATE TABLE fails instead of vanishing', () => {
    const e = ex();
    const r = e.executeQuery(
      'CREATE TABLE t_named (id INT, ref INT, CONSTRAINT fk_x FOREIGN KEY (ref) REFERENCES products(product_id));',
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Naming a constraint with CONSTRAINT is not supported/);
    expect(e.executeQuery('SELECT * FROM t_named;').success).toBe(false);
  });

  it('GRANT / CREATE ROLE still succeed as LABELED simulations (Day 55)', () => {
    const e = ex();
    const g = e.executeQuery('GRANT SELECT ON products TO analyst;');
    expect(g.success).toBe(true);
    expect(g.rows[0]?.status).toMatch(/^Simulated: GRANT/);
    expect(g.rows[0]?.status).toMatch(/concept-only/);
    const role = e.executeQuery('CREATE ROLE analyst;');
    expect(role.success).toBe(true);
    expect(role.rows[0]?.status).toMatch(/^Simulated: CREATE ROLE/);
    expect(role.rows[0]?.status).toMatch(/does not persist/);
  });
});

describe('requireIfExists validator flag (Workstream D)', () => {
  const ddlResult: QueryExecutionResult = {
    success: true,
    columns: [],
    rows: [],
    rowCount: 1,
    executionTimeMs: 1,
    affectedRows: 1,
  };

  it('passes DROP TABLE IF EXISTS', () => {
    const rule: ValidationRule = { targetTable: 'staging', requireIfExists: true };
    const out = validateTaskSolution('DROP TABLE IF EXISTS staging;', ddlResult, rule);
    expect(out.passed).toBe(true);
  });

  it('fails plain DROP TABLE with the IF EXISTS guidance', () => {
    const rule: ValidationRule = { targetTable: 'staging', requireIfExists: true };
    const out = validateTaskSolution('DROP TABLE staging;', ddlResult, rule);
    expect(out.passed).toBe(false);
    expect(out.feedback).toMatch(/must use IF EXISTS/);
  });

  it('the Day-29 teardown tasks all carry the flag', () => {
    const tasks = [
      ...Day_29_MODULE.concepts.flatMap((c) => c.tasks ?? []),
      ...(Day_29_MODULE.challenge?.tasks ?? []),
    ];
    for (const id of ['ddl3-c3-t1', 'ddl3-c3-t2', 'ddl3-hw-3']) {
      const t = tasks.find((x) => x.id === id);
      expect(t, `task ${id} exists`).toBeDefined();
      expect(t?.validation.requireIfExists, `task ${id} requireIfExists`).toBe(true);
    }
  });
});