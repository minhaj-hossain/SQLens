/**
 * P2-B — CALL must BIND procedure parameters. Governing rule: never a
 * plausible-looking wrong answer. Pre-fix probe evidence:
 *   CREATE PROCEDURE sp_update_order_status(target_order_id INT, new_status TEXT)
 *     BEGIN UPDATE orders SET status = new_status WHERE order_id = target_order_id; END;
 *   CALL sp_update_order_status(2, 'completed');  -> "Updated 0 row(s)"
 *   SELECT ... order_id = 2                       -> status still 'pending'
 * The parameter resolved as NULL (ident-guard suppressed for routine bodies),
 * so `order_id = NULL` matched nothing and CALL silently did nothing while
 * reporting success. day44-t2 only passed because its validation is
 * structural (expectedRowCount on the verify SELECT).
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

describe('CALL binds procedure parameters', () => {
  it('two-parameter procedure mutates the target row', () => {
    const ex = new SqlExecutor();
    const create = ex.executeQuery(
      'CREATE PROCEDURE sp_update_order_status(target_order_id INT, new_status TEXT)\n' +
        'BEGIN\n  UPDATE orders SET status = new_status WHERE order_id = target_order_id;\nEND;',
    );
    expect(create.success).toBe(true);

    const call = ex.executeQuery('CALL sp_update_order_status(2, "completed");');
    expect(call.success).toBe(true);
    expect(call.rows?.[0]?.affected_rows).toBe(1);

    const check = ex.executeQuery('SELECT status FROM orders WHERE order_id = 2;');
    expect(check.success).toBe(true);
    expect(check.rows?.[0]?.status).toBe('completed');
  });

  it('numeric parameters bind: restock adds exactly the passed quantity', () => {
    const ex = new SqlExecutor();
    ex.executeQuery(
      'CREATE PROCEDURE sp_restock_product(p_id INT, p_qty INT)\n' +
        'BEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + p_qty WHERE product_id = p_id;\nEND;',
    );
    const call = ex.executeQuery('CALL sp_restock_product(1, 15);');
    expect(call.success).toBe(true);
    expect(call.rows?.[0]?.affected_rows).toBe(1);

    const check = ex.executeQuery('SELECT quantity_in_stock FROM products WHERE product_id = 1;');
    expect(check.rows?.[0]?.quantity_in_stock).toBe(55); // seed 40 + 15
  });

  it('wrong argument count is a named error, not a silent NULL match', () => {
    const ex = new SqlExecutor();
    ex.executeQuery(
      'CREATE PROCEDURE sp_restock_product(p_id INT, p_qty INT)\n' +
        'BEGIN\n  UPDATE products SET quantity_in_stock = quantity_in_stock + p_qty WHERE product_id = p_id;\nEND;',
    );
    const call = ex.executeQuery('CALL sp_restock_product(1);');
    expect(call.success).toBe(false);
    expect(String(call.error)).toMatch(/expects 2 argument\(s\) \(p_id, p_qty\), got 1/);
  });

  it('an unresolvable bare argument is a named error (never bound as NULL)', () => {
    const ex = new SqlExecutor();
    ex.executeQuery(
      'CREATE PROCEDURE sp_mark(p_id INT)\nBEGIN\n  UPDATE products SET price = price WHERE product_id = p_id;\nEND;',
    );
    const call = ex.executeQuery('CALL sp_mark(bogus_ref);');
    expect(call.success).toBe(false);
    expect(String(call.error)).toMatch(/Unknown column 'bogus_ref' in 'call arguments'/);
  });

  it('parameter substitution never rewrites inside string literals', () => {
    const ex = new SqlExecutor();
    ex.executeQuery(
      'CREATE PROCEDURE sp_set_status(target_order_id INT, new_status TEXT)\n' +
        'BEGIN\n  UPDATE orders SET status = new_status WHERE order_id = target_order_id;\nEND;',
    );
    // 'completed' contains no param name; verify a value equal to a param NAME
    // survives literally in the body string.
    ex.executeQuery('CALL sp_set_status(1, "target_order_id");');
    const check = ex.executeQuery('SELECT status FROM orders WHERE order_id = 1;');
    expect(check.rows?.[0]?.status).toBe('target_order_id');
  });

  it('calling an undefined procedure still simulates success (script compat)', () => {
    const ex = new SqlExecutor();
    const call = ex.executeQuery('CALL sp_never_defined(1);');
    expect(call.success).toBe(true);
    expect(String(call.rows?.[0]?.status)).toMatch(/executed successfully/);
  });
});
