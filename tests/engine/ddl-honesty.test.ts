import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { compareFinalState } from '../../src/lib/sql-engine/state-verification';
import { DatabaseState, SQLDataType } from '../../src/types/database';

/**
 * Workstream E — sandbox honesty + grading precision:
 *  - allowDdlOverwrite re-creates SAY SO in the status row (leniency is never
 *    mistaken for legal SQL — DIALECT §5 matrix note);
 *  - DDL correctness rides the SCHEMA (column names + optional type kinds),
 *    never row counts alone (GRADING_POLICY Rule 2 addition);
 *  - state-diff messages name the shape (missing/extra table/column, empty-
 *    table row shapes) instead of generic count/DML advice.
 */
function mkState(def: {
  tables: Record<string, unknown[]>;
  cols?: Record<string, string[]>;
}): DatabaseState {
  const schemas: DatabaseState['schemas'] = {};
  for (const name of Object.keys(def.tables)) {
    schemas[name] = {
      name,
      displayName: name.toUpperCase(),
      description: '',
      columns: (def.cols?.[name] ?? ['id']).map((c) => ({
        name: c,
        type: 'string' as SQLDataType,
      })),
    };
  }
  return { tables: def.tables as DatabaseState['tables'], schemas };
}

describe('sandbox overwrite honesty (Workstream E)', () => {
  it('CREATE TABLE re-create under allowDdlOverwrite says so in the status row', () => {
    const e = new SqlExecutor();
    e.allowDdlOverwrite = true;
    const first = e.executeQuery('CREATE TABLE honest_t (id INT);');
    expect(first.rows[0]?.status).toMatch(/created successfully/);
    const second = e.executeQuery('CREATE TABLE honest_t (id INT);');
    expect(second.success).toBe(true);
    expect(second.rows[0]?.status).toMatch(/already existed — dropped and re-created for retry/);
    expect(second.rows[0]?.status).toMatch(/IF NOT EXISTS/);
  });

  it('without allowDdlOverwrite a bare re-CREATE still errors (real SQL)', () => {
    const e = new SqlExecutor(); // default: strict
    e.executeQuery('CREATE TABLE strict_t (id INT);');
    const second = e.executeQuery('CREATE TABLE strict_t (id INT);');
    expect(second.success).toBe(false);
    expect(String(second.error)).toMatch(/already exists/);
  });

  it('CREATE INDEX re-create under allowDdlOverwrite says so', () => {
    const e = new SqlExecutor();
    e.allowDdlOverwrite = true;
    const first = e.executeQuery('CREATE INDEX idx_honest ON products (name);');
    expect(first.rows[0]?.status).toMatch(/created on products/);
    const second = e.executeQuery('CREATE INDEX idx_honest ON products (name);');
    expect(second.success).toBe(true);
    expect(second.rows[0]?.status).toMatch(/already existed — dropped and re-created for retry/);
    expect(second.rows[0]?.status).toMatch(/DROP INDEX/);
  });

  it('bare CREATE VIEW re-create says it replaced; OR REPLACE stays quiet', () => {
    const e = new SqlExecutor();
    e.allowDdlOverwrite = true;
    e.executeQuery('CREATE VIEW honest_v AS SELECT product_id FROM products;');
    const second = e.executeQuery('CREATE VIEW honest_v AS SELECT product_id FROM products;');
    expect(second.success).toBe(true);
    expect(second.rows[0]?.status).toMatch(/already existed — replaced for retry/);
    expect(second.rows[0]?.status).toMatch(/OR REPLACE/);
    const replace = e.executeQuery(
      'CREATE OR REPLACE VIEW honest_v AS SELECT name FROM products;',
    );
    expect(replace.success).toBe(true);
    expect(replace.rows[0]?.status ?? '').not.toMatch(/replaced for retry/); // legal path, no note
  });
});

describe('DDL state-diff messages name the shape (Workstream E)', () => {
  it('missing / extra tables are named', () => {
    const expected = mkState({ tables: { gone_t: [] }, cols: { gone_t: ['id'] } });
    const actual = mkState({ tables: { other_t: [] }, cols: { other_t: ['id'] } });
    const v = compareFinalState(actual, expected);
    expect(v.ok).toBe(false);
    expect(v.message).toMatch(/Expected table 'gone_t' is missing from the database/);

    const extra = mkState({ tables: { gone_t: [], stray_t: [] }, cols: { gone_t: ['id'], stray_t: ['id'] } });
    const v2 = compareFinalState(extra, mkState({ tables: { gone_t: [] }, cols: { gone_t: ['id'] } }));
    expect(v2.ok).toBe(false);
    expect(v2.message).toMatch(/Table 'stray_t' should not exist/);
  });

  it('missing / unexpected columns are named (schema, not row counts)', () => {
    const expected = mkState({ tables: { t: [] }, cols: { t: ['id', 'rating'] } });
    const actual = mkState({ tables: { t: [] }, cols: { t: ['id'] } });
    expect(compareFinalState(actual, expected).message).toMatch(
      /Table 't' is missing column\(s\): rating/,
    );
    const withExtra = mkState({ tables: { t: [] }, cols: { t: ['id', 'bogus'] } });
    expect(compareFinalState(withExtra, mkState({ tables: { t: [] }, cols: { t: ['id'] } })).message).toMatch(
      /Table 't' has unexpected column\(s\): bogus/,
    );
  });

  it('empty-table row shapes get schema-speak, not DML advice', () => {
    const expectedEmpty = mkState({ tables: { t: [] }, cols: { t: ['id'] } });
    const actualRows = mkState({ tables: { t: [{ id: 1 }] }, cols: { t: ['id'] } });
    const v = compareFinalState(actualRows, expectedEmpty);
    expect(v.ok).toBe(false);
    expect(v.message).toMatch(/should be EMPTY at this step/);
    expect(v.message).toMatch(/extra INSERT/);

    const v2 = compareFinalState(expectedEmpty, mkState({ tables: { t: [{ id: 1 }] }, cols: { t: ['id'] } }));
    expect(v2.ok).toBe(false);
    expect(v2.message).toMatch(/missing 1 row\(s\) that the reference state has/);
    expect(v2.message).not.toMatch(/Check which rows you targeted/);
  });
});