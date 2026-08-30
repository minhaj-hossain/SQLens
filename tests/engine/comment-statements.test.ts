/**
 * SQLens Engine — comment-only statement handling (P9.6)
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

function fresh() {
  return new SqlExecutor();
}

describe('empty/comment-only queries', () => {
  it('a trailing comment after ; is NOT an empty query error', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT name FROM products ORDER BY price DESC LIMIT 5; -- Task 2: Partial Guidance - active customer roster',
    );
    expect(r.success).toBe(true);
    expect(r.error).toBeFalsy();
    expect(r.rowCount).toBe(5);
  });

  it('a full script ending in a comment-only chunk runs the real statement', () => {
    const ex = fresh();
    const r = ex.executeQuery("SELECT name, city FROM students WHERE city = 'Dhaka';\n-- done");
    expect(r.success).toBe(true);
    expect(r.error).toBeFalsy();
    expect(r.rowCount).toBeGreaterThan(0);
  });

  it('a comment-only script yields no statements (Empty script, not Empty query)', () => {
    const ex = fresh();
    const r = ex.executeQuery('-- just a comment\n');
    expect(r.success).toBe(false);
    expect(r.error).toBe('Empty script');
  });

  it('inline comments in a real statement still execute', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT COUNT(*) AS c FROM products; /* and a block */\nSELECT * FROM products LIMIT 2; -- final',
    );
    expect(r.success).toBe(true);
    expect(r.error).toBeFalsy();
  });
});