import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

describe('Phase 2: Stored Routines & Trigger Execution (Days 43–48 Foundations)', () => {
  it('supports CREATE FUNCTION and invoking user-defined scalar function in SELECT', () => {
    const engine = new SqlExecutor();

    // 1. Create scalar function
    const createRes = engine.executeQuery(`
      CREATE FUNCTION fn_calculate_tax(subtotal DECIMAL, tax_rate DECIMAL)
      RETURNS DECIMAL
      RETURN subtotal * tax_rate;
    `);
    expect(createRes.success).toBe(true);

    // 2. Invoke function in query
    const callRes = engine.executeQuery(`
      SELECT product_id, name, price, fn_calculate_tax(price, 0.10) AS tax
      FROM products
      WHERE product_id = 1;
    `);
    expect(callRes.success).toBe(true);
    expect(callRes.rowCount).toBe(1);
    expect(callRes.rows[0].tax).toBeCloseTo(1.599, 2);

    // 3. Drop function
    const dropRes = engine.executeQuery('DROP FUNCTION fn_calculate_tax;');
    expect(dropRes.success).toBe(true);
  });

  it('supports multi-step CREATE PROCEDURE and CALL execution', () => {
    const engine = new SqlExecutor();

    const createRes = engine.executeQuery(`
      CREATE PROCEDURE sp_restock_product(p_id INT, qty INT)
      BEGIN
        UPDATE products SET quantity_in_stock = quantity_in_stock + 25 WHERE product_id = 1;
      END
    `);
    expect(createRes.success).toBe(true);

    const stockBefore = engine.executeQuery('SELECT quantity_in_stock FROM products WHERE product_id = 1;').rows[0].quantity_in_stock;

    const callRes = engine.executeQuery('CALL sp_restock_product(1, 25);');
    expect(callRes.success).toBe(true);

    const stockAfter = engine.executeQuery('SELECT quantity_in_stock FROM products WHERE product_id = 1;').rows[0].quantity_in_stock;
    expect(stockAfter).toBe(stockBefore + 25);
  });

  it('supports CREATE TRIGGER and automatic trigger firing on UPDATE', () => {
    const engine = new SqlExecutor();

    // 1. Create audit table
    engine.executeQuery(`
      CREATE TABLE price_audit (
        audit_id INTEGER PRIMARY KEY AUTO_INCREMENT,
        product_id INTEGER,
        old_price DECIMAL,
        new_price DECIMAL
      );
    `);

    // 2. Create AFTER UPDATE trigger
    const createTrg = engine.executeQuery(`
      CREATE TRIGGER trg_log_price_change
      AFTER UPDATE ON products
      FOR EACH ROW
      BEGIN
        INSERT INTO price_audit (product_id, old_price, new_price)
        VALUES (OLD.product_id, OLD.price, NEW.price);
      END
    `);
    expect(createTrg.success).toBe(true);

    // 3. Update a product price
    const updateRes = engine.executeQuery('UPDATE products SET price = 99.99 WHERE product_id = 1;');
    expect(updateRes.success).toBe(true);

    // 4. Verify trigger wrote to price_audit
    const auditRes = engine.executeQuery('SELECT * FROM price_audit WHERE product_id = 1;');
    expect(auditRes.success).toBe(true);
    expect(auditRes.rowCount).toBe(1);
    expect(auditRes.rows[0].new_price).toBe(99.99);
  });
});
