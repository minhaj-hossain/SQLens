import { describe, expect, it } from 'vitest';
import {
  readLiveTables,
  resolveLiveRows,
  resolveRowCount,
} from '../../src/lib/sql-engine/live-table-view';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { INITIAL_TABLES } from '../../src/content/database/tables';

/**
 * Phase 2 (live database explorer) regression tests.
 *
 * The bug these lock down: every preview rendered the static seed, so a learner
 * who inserted a row still saw "products (28 rows)" while the grader compared
 * live state. The counts contradicted each other and a CORRECT insert looked
 * broken. The explorer must therefore read the executor snapshot and fall back
 * to seed only when no executor is wired.
 */
const PRODUCTS_SEED = INITIAL_TABLES.products.length;
const CUSTOMERS_SEED = INITIAL_TABLES.customers.length;

const INSERT_PRODUCT =
  "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);";

describe('live-table-view (Phase 2 explorer)', () => {
  it('falls back to the static seed when no executor snapshot is wired', () => {
    const view = resolveLiveRows('products', readLiveTables(undefined));
    expect(view.source).toBe('seed');
    expect(view.rows.length).toBe(PRODUCTS_SEED);
    expect(view.liveCount).toBe(PRODUCTS_SEED);
    expect(view.delta).toBe(0);
    // No live data → no "seed N → now M" band (nothing changed).
    expect(view.deltaLabel).toBe('');
  });

  it('shows the learner live rows + a delta label after their own INSERT', () => {
    const host = new SqlExecutor();
    host.executeQuery(INSERT_PRODUCT);

    const liveTables = readLiveTables(host.getDatabaseState);
    const view = resolveLiveRows('products', liveTables);

    expect(view.source).toBe('live');
    expect(view.seedCount).toBe(PRODUCTS_SEED);
    expect(view.liveCount).toBe(PRODUCTS_SEED + 1);
    expect(view.delta).toBe(1);
    expect(view.deltaLabel).toBe(`seed ${PRODUCTS_SEED} → now ${PRODUCTS_SEED + 1} (+1)`);
    // The learner's own row is actually in the rendered set.
    expect(view.rows.at(-1)).toMatchObject({ name: 'Ultra Wireless Mouse' });
    // Untouched tables stay at seed (and report no delta).
    expect(resolveRowCount('customers', liveTables)).toBe(CUSTOMERS_SEED);
    expect(resolveLiveRows('customers', liveTables).delta).toBe(0);
  });

  it('reports negative deltas for DELETEs (and never lies about seed)', () => {
    const host = new SqlExecutor();
    host.executeQuery('DELETE FROM products WHERE product_id = 1;');
    const view = resolveLiveRows('products', readLiveTables(host.getDatabaseState));
    expect(view.delta).toBe(-1);
    expect(view.deltaLabel).toBe(`seed ${PRODUCTS_SEED} → now ${PRODUCTS_SEED - 1} (-1)`);
  });

  it('live counts match the executor after reset (fresh-task retry contract)', () => {
    const host = new SqlExecutor();
    host.executeQuery(INSERT_PRODUCT);
    expect(resolveRowCount('products', readLiveTables(host.getDatabaseState))).toBe(
      PRODUCTS_SEED + 1,
    );
    // `fresh` tasks reset before every submit (P0), so the explorer must snap
    // back to the seed count — otherwise retries look like they accumulate.
    host.resetDatabase();
    const afterReset = resolveLiveRows('products', readLiveTables(host.getDatabaseState));
    expect(afterReset.liveCount).toBe(PRODUCTS_SEED);
    expect(afterReset.delta).toBe(0);
    expect(afterReset.deltaLabel).toBe('');
  });

  it('is defensive: a throwing snapshot hook degrades to seed, never crashes', () => {
    const liveTables = readLiveTables(() => {
      throw new Error('executor disposed');
    });
    expect(liveTables).toBeNull();
    expect(resolveLiveRows('products', liveTables).source).toBe('seed');
  });

  it('accepts a DETACHED executor method reference (no silent seed fallback)', () => {
    // Regression: `readLiveTables(host.getDatabaseState)` used to throw
    // "cannot read properties of undefined (reading db)" for an unbound method
    // and silently degrade to the seed — the exact stale-count bug Phase 2 fixes.
    const host = new SqlExecutor();
    host.executeQuery(INSERT_PRODUCT);
    const detached = host.getDatabaseState; // deliberately NOT wrapped in an arrow
    const view = resolveLiveRows('products', readLiveTables(detached));
    expect(view.source).toBe('live');
    expect(view.delta).toBe(1);
  });

  it('handles unknown/empty table names without throwing', () => {
    const view = resolveLiveRows('', null);
    expect(view.rows).toEqual([]);
    expect(view.liveCount).toBe(0);
    expect(resolveRowCount(undefined, null)).toBe(0);
  });
});
