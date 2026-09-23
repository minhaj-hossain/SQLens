import { describe, it, expect } from 'vitest';
import { SQL_KEYWORDS, SQL_DATA_TYPES, SQL_DDL_MODIFIERS } from '../../src/lib/sql-keywords';
import { SQL_TYPE_KINDS } from '../../src/lib/sql-engine/sql-type-registry';

/**
 * Workstream C single-source guards:
 *  - SQL_DATA_TYPES must stay set-equal to the ENGINE type registry (adding a
 *    type on one side only fails here — amend both together);
 *  - the vocabulary that lives in sql-keywords must actually be highlighted;
 *  - unsupported vocabulary (CASCADE/RESTRICT/GRANT/REVOKE) stays OUT until
 *    Workstream D decides its fate.
 */
describe('sql-keywords (Workstream C single source)', () => {
  it('SQL_DATA_TYPES is set-equal to the engine type registry (drift guard)', () => {
    const registry = new Set(SQL_TYPE_KINDS.map((e) => e.base));
    expect(new Set(SQL_DATA_TYPES)).toEqual(registry);
  });

  it('every data type and DDL modifier is in SQL_KEYWORDS', () => {
    const set = new Set(SQL_KEYWORDS);
    for (const t of SQL_DATA_TYPES) expect(set.has(t)).toBe(true);
    for (const m of SQL_DDL_MODIFIERS) expect(set.has(m)).toBe(true);
  });

  it('contains the taught-but-missing keywords (C gap fill)', () => {
    for (const kw of [
      'CHECK', 'EXISTS', 'NOT EXISTS', 'SAVEPOINT', 'ROLLBACK TO SAVEPOINT',
      'WITH RECURSIVE', 'CREATE VIEW', 'DROP VIEW', 'CREATE OR REPLACE VIEW',
      'IS TRUE', 'IS FALSE', 'CALL',
    ]) {
      expect(SQL_KEYWORDS).toContain(kw);
    }
  });

  it('keeps unsupported vocabulary OUT (Workstream D decision)', () => {
    for (const kw of ['CASCADE', 'RESTRICT', 'GRANT', 'REVOKE']) {
      expect(SQL_KEYWORDS).not.toContain(kw);
    }
  });
});