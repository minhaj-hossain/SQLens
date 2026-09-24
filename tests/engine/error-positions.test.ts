import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

/**
 * M4 P4.17 — end-to-end: a learner's failed statement must come back with a
 * REAL position in the text they typed. Every assertion re-reads the offsets
 * out of the original SQL (`sql.slice(offsetStart, offsetEnd)`), so a position
 * that drifts from the source cannot pass.
 */
describe('engine error positions end to end (M4 P4.17)', () => {
  it('points at an unknown projection column on its own line', () => {
    const sql = 'SELECT name,\n  emial\nFROM customers;';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Unknown column 'emial'/);
    expect(r.errorPosition?.line).toBe(2);
    expect(r.errorPosition?.col).toBe(3);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('emial');
    expect(r.errorTokenOccurrences).toBe(1);
  });

  it('points at an unknown column in WHERE, three lines down', () => {
    const sql = 'SELECT name\nFROM customers\nWHERE custmer_id = 1;';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(r.errorPosition?.line).toBe(3);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('custmer_id');
  });

  it('points at an unknown table name', () => {
    const sql = 'SELECT * FROM custmers;';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/custmers/);
    expect(r.errorPosition?.col).toBe(15);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('custmers');
  });

  it('re-anchors onto the real script line for a later statement', () => {
    // Without the P4-17 shift this reported line 1 (the position is computed
    // inside the single statement, which starts on line 2 of the script).
    const sql = 'SELECT 1;\nSELECT no_col FROM products;';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(r.errorPosition?.line).toBe(2);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('no_col');
  });

  it('points at where an unparseable statement begins, skipping comments', () => {
    const sql = '-- typo below\nSELCT * FROM products;';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Unsupported or unparseable/i);
    expect(r.errorPosition?.line).toBe(2);
    expect(r.errorPosition?.col).toBe(1);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('SELCT');
  });

  it('locates a DDL type typo as the bare type name', () => {
    const sql = 'CREATE TABLE t (\n  id VARCHR(20)\n);';
    const r = new SqlExecutor().executeQuery(sql);

    expect(r.success).toBe(false);
    expect(r.errorPosition?.line).toBe(2);
    expect(sql.slice(r.errorPosition!.offsetStart, r.errorPosition!.offsetEnd)).toBe('VARCHR');
  });

  it('never invents a position when the message quotes no name', () => {
    const r = new SqlExecutor().executeQuery('');

    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Empty script/i);
    expect(r.errorPosition).toBeUndefined();
    expect(r.errorTokenOccurrences).toBeUndefined();
  });

  it('adds nothing to successful results', () => {
    const r = new SqlExecutor().executeQuery('SELECT 1;');

    expect(r.success).toBe(true);
    expect(r.errorPosition).toBeUndefined();
    expect(r.errorTokenOccurrences).toBeUndefined();
  });
});
