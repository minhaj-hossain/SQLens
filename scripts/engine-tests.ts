/**
 * SQL engine regression tests for PG1 features:
 * RIGHT/FULL/CROSS joins, set operations (UNION/UNION ALL/INTERSECT/EXCEPT),
 * and CASE WHEN expressions.
 *
 * Run with: npm run test:engine
 */
import { SqlExecutor } from '../src/lib/sql-engine/executor';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function assert(desc: string, cond: boolean, extra?: string) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(`${desc}${extra ? ` — ${extra}` : ''}`);
  }
}

function run(sql: string) {
  return new SqlExecutor().executeQuery(sql);
}

// ---- Joins -----------------------------------------------
const inner = run(
  'SELECT p.product_id, c.category_id FROM products p INNER JOIN categories c ON p.category_id = c.category_id'
);
assert('INNER JOIN executes', inner.success === true, JSON.stringify(inner.error));
assert('INNER JOIN returns >= 1 row', inner.rowCount >= 1, `rows=${inner.rowCount}`);

const right = run(
  'SELECT p.product_id, c.category_id FROM products p RIGHT JOIN categories c ON p.category_id = c.category_id'
);
assert('RIGHT JOIN executes', right.success === true, right.error);
assert('RIGHT JOIN keeps all categories', right.rowCount >= inner.rowCount, `right=${right.rowCount} inner=${inner.rowCount}`);

const full = run(
  'SELECT p.product_id, c.category_id FROM products p FULL OUTER JOIN categories c ON p.category_id = c.category_id'
);
assert('FULL OUTER JOIN executes', full.success === true, full.error);
assert('FULL OUTER JOIN row count sanity', full.rowCount >= right.rowCount, `full=${full.rowCount} right=${right.rowCount}`);

const cross = run('SELECT p.product_id, c.category_id FROM products p CROSS JOIN categories c');
assert('CROSS JOIN executes', cross.success === true, cross.error);

// Recompute exact expectations robustly:
const prodCount = run('SELECT product_id FROM products').rowCount;
const catCount = run('SELECT category_id FROM categories').rowCount;
assert(
  'CROSS JOIN rowcount == |P|*|C|',
  cross.rowCount === prodCount * catCount,
  `cross=${cross.rowCount} expected=${prodCount * catCount}`
);

// ---- Set operations ---------------------------------------
const all = run(
  'SELECT category_id FROM products UNION ALL SELECT category_id FROM products'
);
const uni = run(
  'SELECT category_id FROM products UNION SELECT category_id FROM products'
);
assert('UNION ALL executes', all.success === true);
assert('UNION executes', uni.success === true);
assert('UNION removes duplicates (<= union all)', uni.rowCount <= all.rowCount, `uni=${uni.rowCount} all=${all.rowCount}`);

const leftSet = run('SELECT category_id FROM products WHERE price < 30');
const leftRowCount = leftSet.rowCount;
const rightSet = run('SELECT category_id FROM products WHERE category_id BETWEEN 1 AND 3');
const inter = run(
  'SELECT category_id FROM products WHERE price < 30 INTERSECT SELECT category_id FROM products WHERE category_id BETWEEN 1 AND 3'
);
const except = run(
  'SELECT category_id FROM products WHERE price < 30 EXCEPT SELECT category_id FROM products WHERE category_id BETWEEN 1 AND 3'
);
assert('INTERSECT executes', inter.success);
assert('INTERSECT <= left', inter.rowCount <= leftRowCount, `inter=${inter.rowCount} left=${leftRowCount}`);
assert('EXCEPT executes', except.success);
assert('EXCEPT <= left', except.rowCount <= leftRowCount, `except=${except.rowCount} left=${leftRowCount}`);

// ---- CASE WHEN ---------------------------------------------------------
const c = run(
  "SELECT name, CASE WHEN price < 20 THEN 'cheap' WHEN price < 60 THEN 'mid' ELSE 'premium' END AS bucket FROM products"
);
assert('CASE WHEN executes', c.success === true, c.error);
assert('CASE has bucket column', c.success && c.columns.some((col) => col === 'bucket'));
assert('CASE rowCount matches products', c.rowCount === prodCount, `case=${c.rowCount} prod=${prodCount}`);
if (c.success && c.rows.length > 0) {
  const bucketValues = new Set(c.rows.map((r) => r.bucket));
  assert('CASE produces labelled buckets', [...bucketValues].some((v) => v !== null), String([...bucketValues]));
}

// Interactive live-demo / explain still works (no regression)
assert('EXPLAIN still works', run('EXPLAIN SELECT * FROM products').success);
assert('CTE still works', run('WITH x AS (SELECT category_id FROM products) SELECT * FROM x').success);

// ---- DML / DDL / transaction lifecycle (v2 verification, Day 19/20) -------
{
  const ex = new SqlExecutor();

  // INSERT → SELECT
  let r = ex.executeQuery(
    "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);",
  );
  assert('INSERT executes', r.success === true, r.error);
  r = ex.executeQuery("SELECT name FROM products WHERE name = 'Ultra Wireless Mouse';");
  assert('INSERT visible to SELECT', r.success && r.rowCount === 1, `rows=${r.rowCount}`);

  // UPDATE → SELECT
  r = ex.executeQuery("UPDATE products SET price = price * 1.10 WHERE product_id = 1;");
  assert('UPDATE executes', r.success === true, r.error);
  r = ex.executeQuery("SELECT price FROM products WHERE product_id = 1;");
  const origPrice = 15.99;
  assert(
    'UPDATE applied to exactly the targeted row',
    r.success && r.rows.length === 1 && Math.abs(Number(r.rows[0].price) - origPrice * 1.1) < 0.0001,
    `price=${r.rows[0]?.price}`,
  );

  // DELETE → SELECT
  const preDeleteCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  r = ex.executeQuery("DELETE FROM products WHERE quantity_in_stock = 0;");
  assert('DELETE executes', r.success === true, r.error);
  const postDeleteCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  assert('DELETE lowered the row count', postDeleteCount < preDeleteCount, `pre=${preDeleteCount} post=${postDeleteCount}`);
}

// ---- DDL / transactions / reset (cont.) -----------------------------------
{
  const ex = new SqlExecutor();

  // Transactions: BEGIN → mutate → ROLLBACK restores state
  let r = ex.executeQuery('BEGIN;');
  assert('BEGIN executes', r.success === true, r.error);
  const preTxCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  ex.executeQuery("DELETE FROM products WHERE quantity_in_stock < 50;");
  const midTxCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  assert('mutations inside transaction visible', midTxCount < preTxCount, `pre=${preTxCount} mid=${midTxCount}`);
  r = ex.executeQuery('ROLLBACK;');
  assert('ROLLBACK executes', r.success === true, r.error);
  const postRollbackCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  assert('ROLLBACK restored the data', postRollbackCount === preTxCount, `pre=${preTxCount} post=${postRollbackCount}`);

  // Transactions: BEGIN → mutate → COMMIT persists
  r = ex.executeQuery('BEGIN;');
  ex.executeQuery("DELETE FROM products WHERE quantity_in_stock < 50;");
  const commitMid = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  r = ex.executeQuery('COMMIT;');
  assert('COMMIT executes', r.success === true, r.error);
  const postCommitCount = ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows[0]?.c as number;
  assert('COMMIT persisted the mutation', postCommitCount === commitMid, `committed=${postCommitCount} mid=${commitMid}`);

  // DDL: CREATE TABLE
  r = ex.executeQuery("CREATE TABLE product_tags (tag_id INT AUTO_INCREMENT PRIMARY KEY, tag_name VARCHAR(50));");
  assert('CREATE TABLE executes', r.success === true, r.error);
  r = ex.executeQuery('SELECT * FROM product_tags;');
  assert('new table is queryable', r.success === true, r.error);

  // DDL: re-create the same table → error (isolation guard for Day 20)
  r = ex.executeQuery("CREATE TABLE product_tags (tag_id INT AUTO_INCREMENT PRIMARY KEY, tag_name VARCHAR(50));");
  assert('re-CREATE same table fails (no silent overwrite)', r.success === false, `success=${r.success}`);

  // DDL: ALTER TABLE ADD COLUMN
  r = ex.executeQuery("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;");
  assert('ALTER TABLE ADD COLUMN executes', r.success === true, r.error);
  const cols = ex.executeQuery('SELECT * FROM products;').columns;
  assert('new column present after ALTER', cols.includes('is_featured'), cols.join(','));

  // DDL: DROP TABLE IF EXISTS (idempotent)
  r = ex.executeQuery('DROP TABLE IF EXISTS product_tags;');
  assert('DROP TABLE executes', r.success === true, r.error);
  r = ex.executeQuery('DROP TABLE IF EXISTS product_tags;');
  assert('DROP TABLE IF EXISTS is idempotent', r.success === true, r.error);
}

// ---- resetDatabase + canonical seed state --------------------------------
{
  // A FRESH executor, so the "reset restores seed" invariant is unambiguous.
  const ex2 = new SqlExecutor();
  const seedCount = ex2.executeQuery('SELECT * FROM products;').rowCount;

  ex2.executeQuery("CREATE TABLE product_tags (tag_id INT AUTO_INCREMENT PRIMARY KEY, tag_name VARCHAR(50));");
  ex2.executeQuery("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;");
  ex2.executeQuery("DELETE FROM products WHERE quantity_in_stock < 50;");
  const mutatedCount = ex2.executeQuery('SELECT * FROM products;').rowCount;
  assert('mutated state differs from seed', mutatedCount < seedCount, `seed=${seedCount} mutated=${mutatedCount}`);

  ex2.resetDatabase();

  const resetCount = ex2.executeQuery('SELECT * FROM products;').rowCount;
  assert('resetDatabase restores seed row count', resetCount === seedCount, `seed=${seedCount} after=${resetCount}`);

  const productCols = ex2.executeQuery('SELECT * FROM products;').columns;
  assert('resetDatabase removes ALTERed column', !productCols.includes('is_featured'), productCols.join(','));

  const createdAfter = (() => {
    const res = ex2.executeQuery('SELECT * FROM product_tags;');
    return res.success ? 'present' : 'absent';
  })();
  assert('resetDatabase drops created tables', createdAfter === 'absent', createdAfter);

  // A brand-new SqlExecutor is always pristine.
  const fresh = new SqlExecutor();
  const freshCols = fresh.executeQuery('SELECT * FROM products;').columns;
  assert('fresh SqlExecutor has no ALTERed column', !freshCols.includes('is_featured'), freshCols.join(','));
  const createdFresh = (() => {
    const res = fresh.executeQuery('SELECT * FROM product_tags;');
    return res.success ? 'present' : 'absent';
  })();
  assert('fresh SqlExecutor has no created tables', createdFresh === 'absent', createdFresh);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}