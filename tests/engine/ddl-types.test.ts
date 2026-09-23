import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { resolveSqlType, describeSqlKind } from '../../src/lib/sql-engine/sql-type-registry';
import { compareFinalState } from '../../src/lib/sql-engine/state-verification';
import { DatabaseState, SQLDataType } from '../../src/types/database';

/**
 * SQL type registry + strict DDL typing (Workstream B — DDL audit):
 *   - accepted type tokens resolve to canonical kinds via the registry;
 *   - an UNKNOWN type fails with a named error + "did you mean" suggestion;
 *   - a column with NO type fails with a named error (never silently dropped);
 *   - table-level constraints leave no phantom columns behind;
 *   - verifyColumnTypes failures speak learner-facing type labels.
 */
describe('SQL type registry (Workstream B)', () => {
  const ex = (): SqlExecutor => {
    const e = new SqlExecutor();
    e.allowDdlOverwrite = true;
    return e;
  };

  describe('resolveSqlType', () => {
    it('maps canonical types to kinds (precision-insensitive)', () => {
      expect(resolveSqlType('INT')).toEqual({ ok: true, kind: 'number' });
      expect(resolveSqlType('INTEGER')).toEqual({ ok: true, kind: 'number' });
      expect(resolveSqlType('VARCHAR(50)')).toEqual({ ok: true, kind: 'string' });
      expect(resolveSqlType('DECIMAL(10,2)')).toEqual({ ok: true, kind: 'decimal' });
      expect(resolveSqlType('DATETIME')).toEqual({ ok: true, kind: 'date' });
      expect(resolveSqlType('BOOLEAN')).toEqual({ ok: true, kind: 'boolean' });
      expect(resolveSqlType('TEXT')).toEqual({ ok: true, kind: 'string' });
      expect(resolveSqlType('SERIAL')).toEqual({ ok: true, kind: 'number' });
      expect(resolveSqlType('REAL')).toEqual({ ok: true, kind: 'decimal' });
      expect(resolveSqlType('TIMESTAMP')).toEqual({ ok: true, kind: 'date' });
    });

    it('suggests the closest canonical type for typos', () => {
      expect(resolveSqlType('VARCHR(20)')).toEqual({ ok: false, suggestion: 'VARCHAR' });
      expect(resolveSqlType('DATATIME')).toEqual({ ok: false, suggestion: 'DATETIME' });
      expect(resolveSqlType('BOOLEANX')).toEqual({ ok: false, suggestion: 'BOOLEAN' });
    });

    it('offers no suggestion for far-off garbage', () => {
      const r = resolveSqlType('WIDGET');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.suggestion).toBeUndefined();
    });
  });

  describe('describeSqlKind (learner-facing labels)', () => {
    it('names every kind the way a learner wrote it', () => {
      expect(describeSqlKind('number')).toBe('a number type (INT)');
      expect(describeSqlKind('decimal')).toBe('a decimal type (DECIMAL)');
      expect(describeSqlKind('string')).toBe('a text type (VARCHAR/TEXT)');
      expect(describeSqlKind('date')).toBe('a date type (DATE/DATETIME)');
      expect(describeSqlKind('boolean')).toBe('a boolean type (BOOLEAN)');
    });
  });

  describe('executor enforcement (CREATE / ALTER)', () => {
    it('rejects a column with no data type — and creates nothing', () => {
      const e = ex();
      const r = e.executeQuery('CREATE TABLE t_no_type (id);');
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Column 'id' needs a data type/);
      expect(String(r.error)).toMatch(/VARCHAR\(50\)/);
      expect(e.executeQuery('SELECT * FROM t_no_type;').success).toBe(false);
    });

    it('rejects an unknown type with a did-you-mean suggestion', () => {
      const r = ex().executeQuery('CREATE TABLE t_bad (id VARCHR(20));');
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Unknown data type 'VARCHR\(20\)' for column 'id'/);
      expect(String(r.error)).toMatch(/did you mean 'VARCHAR'/);
    });

    it('rejects an empty column list', () => {
      const r = ex().executeQuery('CREATE TABLE t_empty ();');
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/needs a column list/);
    });

    it('rejects ALTER ADD COLUMN without a type', () => {
      const r = ex().executeQuery('ALTER TABLE products ADD COLUMN tagline;');
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Column 'tagline' needs a data type/);
    });

    it('rejects an unknown type in ALTER ADD COLUMN', () => {
      const r = ex().executeQuery('ALTER TABLE products ADD COLUMN flag BOGUS;');
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/Unknown data type 'BOGUS'/);
    });

    it('registers the canonical kind for every accepted family', () => {
      const e = ex();
      const r = e.executeQuery(
        'CREATE TABLE t_kinds (n INTEGER, s VARCHAR(40), d DECIMAL(8,2), dt DATETIME, b BOOLEAN, tx TEXT, sn SERIAL, rr REAL, ts TIMESTAMP);'
      );
      expect(r.success).toBe(true);
      const cols = e.getDatabaseState().schemas['t_kinds'].columns;
      const kind = (n: string): string => String(cols.find((c) => c.name === n)?.type);
      expect(kind('n')).toBe('number');
      expect(kind('s')).toBe('string');
      expect(kind('d')).toBe('decimal');
      expect(kind('dt')).toBe('date');
      expect(kind('b')).toBe('boolean');
      expect(kind('tx')).toBe('string');
      expect(kind('sn')).toBe('number');
      expect(kind('rr')).toBe('decimal');
      expect(kind('ts')).toBe('date');
    });

    it('table-level constraints leave NO phantom columns (metadata kept)', () => {
      const e = ex();
      const r = e.executeQuery(
        'CREATE TABLE t_ph (id INT, ref INT, PRIMARY KEY (id), FOREIGN KEY (ref) REFERENCES products(product_id), UNIQUE (ref), CHECK (id > 0));'
      );
      expect(r.success).toBe(true);
      const cols = e.getDatabaseState().schemas['t_ph'].columns.map((c) => c.name);
      expect(cols).toEqual(['id', 'ref']); // no 'PRIMARY' / 'FOREIGN' / 'UNIQUE' / 'CHECK'
      const meta = e.getDatabaseState().meta?.['t_ph'];
      expect(meta?.fks.map((f) => f.col)).toEqual(['ref']);
      expect(meta?.uniques).toContain('ref');
    });
  });

  describe('verifyColumnTypes failure message', () => {
    function stateWith(kind: SQLDataType): DatabaseState {
      return {
        tables: { t: [] },
        schemas: {
          t: { name: 't', displayName: 'T', description: '', columns: [{ name: 'a', type: kind }] },
        },
      };
    }

    it('names type kinds in learner vocabulary, not engine jargon', () => {
      const verdict = compareFinalState(stateWith('number'), stateWith('string'), { verifyTypes: true });
      expect(verdict.ok).toBe(false);
      expect(verdict.message).toMatch(/was declared as a number type \(INT\)/);
      expect(verdict.message).toMatch(/requires a text type \(VARCHAR\/TEXT\)/);
      expect(verdict.message).not.toMatch(/NUMBER|STRING/);
    });

    it('still accepts kind-equal states (VARCHAR(50) ≡ VARCHAR(200) → both string)', () => {
      // Precision never reaches the schema — both sides are kind 'string'.
      expect(compareFinalState(stateWith('string'), stateWith('string'), { verifyTypes: true }).ok).toBe(true);
    });
  });
});