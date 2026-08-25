/**
 * scripts/probe-engine.ts
 * -----------------------------------------------------------------------------
 * Direct engine probe for the audit: verifies the exact results the real
 * SqlExecutor produces for the suspicious query classes, so conclusions are
 * backed by engine output (not by reading code).
 *
 * Run: npx tsx scripts/probe-engine.ts
 */
import { SqlExecutor } from '../src/lib/sql-engine/executor';

const exec = new SqlExecutor();

function probe(label: string, sql: string) {
  console.log(`\n--- ${label} ---`);
  console.log(`SQL: ${sql}`);
  // Fresh executor per probe so DML earlier in the run cannot contaminate
  // later SELECTs (matches a per-task fresh DB; isolates each measurement).
  const r = new SqlExecutor().executeQuery(sql);
  if (!r.success) {
    console.log(`  ERROR: ${r.error}`);
    return;
  }
  console.log(`  rows: ${r.rowCount}   affectedRows: ${r.affectedRows ?? 'n/a'}`);
  for (const row of r.rows.slice(0, 40)) {
    const t = Object.fromEntries(
      Object.entries(row).filter(([k]) => !k.includes('.'))
    );
    console.log(`    ${JSON.stringify(t)}`);
  }
}

// 1. NOT bug verification (does NOT (...) actually filter?)
probe('NOT (category_id = 1)  [the reported failing case]',
  "SELECT name, category_id FROM products WHERE NOT (category_id = 1);");
probe('category_id != 1  [equivalent, standard SQL]',
  'SELECT name, category_id FROM products WHERE category_id != 1;');
probe('category_id <> 1  [equivalent, alternate operator]',
  'SELECT name, category_id FROM products WHERE category_id <> 1;');
probe('NOT (city = \'Dhaka\') on students  [Day3 masked case]',
  "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');");

// 2. BETWEEN equivalence
probe('price BETWEEN 25 AND 100   [task day03-c2a-t1]',
  'SELECT name, price FROM products WHERE price BETWEEN 25 AND 100;');
probe('price >= 25 AND price <= 100   [equivalent form]',
  'SELECT name, price FROM products WHERE price >= 25 AND price <= 100;');
probe('price BETWEEN 15.99 AND 65.00  [task day03-c2a-t3]',
  'SELECT name, price FROM products WHERE price BETWEEN 15.99 AND 65.00;');

// 3. Datasets for the remaining stale-range tasks
probe("email LIKE '%@example.com'  [task day03-c3a-t1]",
  'SELECT name, email FROM customers WHERE email LIKE \'%@example.com\';');
probe('(cat=1 OR cat=5) AND price<50 AND qty>0  [task day03-hw-5]',
  'SELECT name, category_id, price, quantity_in_stock FROM products WHERE (category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0;');

// 4. DML — how rowCount vs affectedRows behave
probe('UPDATE category 1 restock  [task day19-c2a-t2]',
  'UPDATE products SET quantity_in_stock = quantity_in_stock + 20 WHERE category_id = 1;');
probe('DELETE WHERE quantity_in_stock = 0  [task day19-c2b-t2]',
  'DELETE FROM products WHERE quantity_in_stock = 0;');

// 5. What a CORRECT student query returns for the masked NOT tasks
probe('correct equivalent: category_id != 1  [day03-c1c-t2 expects 28 via bug]',
  'SELECT name, category_id FROM products WHERE category_id != 1;');
probe('correct equivalent: city != \'Dhaka\' on students  [day03-c1c-t1 expects 5 via bug]',
  "SELECT name, city FROM students WHERE city != 'Dhaka';");