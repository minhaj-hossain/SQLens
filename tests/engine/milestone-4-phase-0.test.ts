import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';

describe('Phase 0: Engine & Tools Groundwork (Milestone 4 Foundations)', () => {
  it('supports CREATE VIEW, querying from the view, and DROP VIEW', () => {
    const engine = new SqlExecutor();
    
    // 1. Create View
    const createRes = engine.executeQuery(
      'CREATE VIEW v_cheap_products AS SELECT product_id, name, price FROM products WHERE price < 20;'
    );
    expect(createRes.success).toBe(true);

    // 2. Query from View
    const queryRes = engine.executeQuery('SELECT name, price FROM v_cheap_products;');
    expect(queryRes.success).toBe(true);
    expect(queryRes.rowCount).toBeGreaterThan(0);
    expect(queryRes.rows.every((r: any) => r.price < 20)).toBe(true);

    // 3. Drop View
    const dropRes = engine.executeQuery('DROP VIEW v_cheap_products;');
    expect(dropRes.success).toBe(true);

    // 4. Querying after drop fails
    const postDrop = engine.executeQuery('SELECT * FROM v_cheap_products;');
    expect(postDrop.success).toBe(false);
  });

  it('supports WITH RECURSIVE series generation with depth protection', () => {
    const engine = new SqlExecutor();
    
    // Generates numbers 1 to 5
    const seriesRes = engine.executeQuery(`
      WITH RECURSIVE nums AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM nums WHERE n < 5
      )
      SELECT n FROM nums;
    `);

    expect(seriesRes.success).toBe(true);
    expect(seriesRes.rowCount).toBe(5);
    expect(seriesRes.rows.map((r: any) => r.n)).toEqual([1, 2, 3, 4, 5]);

    // Infinite recursion guard (max 100 loops)
    const infiniteRes = engine.executeQuery(`
      WITH RECURSIVE bad AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM bad WHERE n > 0
      )
      SELECT n FROM bad;
    `);
    expect(infiniteRes.success).toBe(false);
    expect(String(infiniteRes.error)).toMatch(/maximum recursion depth/i);
  });

  it('supports SAVEPOINT, ROLLBACK TO SAVEPOINT, and RELEASE SAVEPOINT', () => {
    const engine = new SqlExecutor();
    
    // Begin transaction
    engine.executeQuery('BEGIN;');
    
    // Insert initial record
    engine.executeQuery(
      "INSERT INTO categories (category_id, name, description) VALUES (901, 'Phase0 Cat', 'Test');"
    );
    expect(engine.executeQuery('SELECT * FROM categories WHERE category_id = 901;').rowCount).toBe(1);

    // Set savepoint
    const spRes = engine.executeQuery('SAVEPOINT sp_before_bad;');
    expect(spRes.success).toBe(true);

    // Insert second record
    engine.executeQuery(
      "INSERT INTO categories (category_id, name, description) VALUES (902, 'Bad Cat', 'Will be rolled back');"
    );
    expect(engine.executeQuery('SELECT * FROM categories WHERE category_id = 902;').rowCount).toBe(1);

    // Rollback to savepoint
    const rbSpRes = engine.executeQuery('ROLLBACK TO SAVEPOINT sp_before_bad;');
    expect(rbSpRes.success).toBe(true);

    // Record 901 remains, 902 is gone
    expect(engine.executeQuery('SELECT * FROM categories WHERE category_id = 901;').rowCount).toBe(1);
    expect(engine.executeQuery('SELECT * FROM categories WHERE category_id = 902;').rowCount).toBe(0);

    // Commit transaction
    const commitRes = engine.executeQuery('COMMIT;');
    expect(commitRes.success).toBe(true);
    expect(engine.executeQuery('SELECT * FROM categories WHERE category_id = 901;').rowCount).toBe(1);
  });

  it('supports CREATE PROCEDURE and CALL dispatching', () => {
    const engine = new SqlExecutor();
    
    const createProc = engine.executeQuery(`
      CREATE PROCEDURE sp_test_proc()
      BEGIN
        UPDATE products SET price = 999.99 WHERE product_id = 1;
      END
    `);
    expect(createProc.success).toBe(true);

    const callRes = engine.executeQuery('CALL sp_test_proc();');
    expect(callRes.success).toBe(true);

    const checkRes = engine.executeQuery('SELECT price FROM products WHERE product_id = 1;');
    expect(checkRes.rows[0].price).toBe(999.99);
  });

  it('validates new Milestone 4 constructs via validator', () => {
    const userSql = 'CREATE VIEW v_test AS SELECT * FROM products;';
    const result = new SqlExecutor().executeQuery(userSql);
    
    const outcome = validateTaskSolution(
      userSql,
      result,
      { requireView: true }
    );
    expect(outcome.passed).toBe(true);

    const missingOutcome = validateTaskSolution(
      'SELECT * FROM products;',
      new SqlExecutor().executeQuery('SELECT * FROM products;'),
      { requireView: true }
    );
    expect(missingOutcome.passed).toBe(false);
    expect(missingOutcome.feedback).toMatch(/VIEW/i);
  });
});
