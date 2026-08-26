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

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}