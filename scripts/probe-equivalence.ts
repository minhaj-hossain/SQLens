/**
 * scripts/probe-equivalence.ts — Phase-1 audit instrument.
 * Asserts the DESIRED behavior of engine + validator on the real code path
 * (SqlExecutor.executeQuery + validateTaskSolution). Fresh executor per probe.
 * [CONTRACT] = must hold after the fix plan. [BASELINE] = regression guard.
 * Run: npx tsx scripts/probe-equivalence.ts (or npm run audit:equivalence)
 */
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../src/lib/sql-engine/validator';

interface Probe {
  id: string;
  kind: 'CONTRACT' | 'BASELINE';
  sql: string;
  /** Skip executing `sql` (e.g. the probe only exercises the validator). */
  skipExec?: boolean;
  /** Reference SQL used to compute the expected dataset for exact-result rules. */
  expectedSql?: string;
  validation?: any;
  checkExec?: (r: any) => string | null;
  checkValid?: (o: { passed: boolean; feedback: string }, r: any) => string | null;
}

const probes: Probe[] = [
  {
    id: 'S1-2 EXISTS must filter (not return the full table)',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.customer_id);',
    checkExec: (r) =>
      !r.success
        ? (/unsupported/i.test(String(r.error)) ? null : `unexpected error: ${r.error}`)
        : r.rowCount === 15
          ? `filter dropped: returned all 15 customers (EXISTS ignored)`
          : null,
  },
  {
    id: 'S1-2 NOT EXISTS anti-join must filter',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.customer_id);',
    checkExec: (r) =>
      !r.success
        ? (/unsupported/i.test(String(r.error)) ? null : `unexpected error: ${r.error}`)
        : r.rowCount === 15
          ? `filter dropped: returned all 15 customers (NOT EXISTS ignored)`
          : null,
  },
  {
    id: 'S1-3 SUBSTR must not silently NULL',
    kind: 'CONTRACT',
    sql: 'SELECT SUBSTR(name, 1, 3) AS short FROM products;',
    checkExec: (r) => {
      if (!r.success) return /unsupported function/i.test(String(r.error)) ? null : `unexpected error: ${r.error}`;
      const allNull = (r.rows ?? []).every((row: any) => row.short == null);
      return allNull ? `valid MySQL evaluated to all-NULL` : null;
    },
  },
  {
    id: 'S1-3 bare COALESCE must not silently NULL',
    kind: 'CONTRACT',
    sql: 'SELECT COALESCE(email, city) AS contact FROM customers;',
    checkExec: (r) => {
      if (!r.success) return /unsupported function/i.test(String(r.error)) ? null : `unexpected error: ${r.error}`;
      const allNull = (r.rows ?? []).every((row: any) => row.contact == null);
      return allNull ? `valid MySQL evaluated to all-NULL` : null;
    },
  },
  {
    id: 'S1-3 typoed function must error, not NULL',
    kind: 'CONTRACT',
    sql: 'SELECT LENGHT(name) AS l FROM products;',
    checkExec: (r) =>
      r.success && (r.rows ?? []).every((row: any) => row.l == null)
        ? `typoed function silently produced NULL instead of an error`
        : null,
  },
  {
    id: 'S1-1 GROUP BY dedupe satisfies a DISTINCT task',
    kind: 'CONTRACT',
    sql: 'SELECT city FROM customers GROUP BY city;',
    expectedSql: 'SELECT DISTINCT city FROM customers;',
    validation: { targetTable: 'customers', requireExactResult: true, requireDistinct: true },
    checkValid: (o) => (o.passed ? null : `identical dataset rejected: ${o.feedback}`),
  },
  {
    id: 'S1-1 strictConstruct still enforces the construct',
    kind: 'BASELINE',
    sql: 'SELECT city FROM customers GROUP BY city;',
    expectedSql: 'SELECT DISTINCT city FROM customers;',
    validation: { targetTable: 'customers', requireExactResult: true, requireDistinct: true, strictConstruct: true },
    checkValid: (o) => (o.passed ? `strict task accepted a non-DISTINCT query` : null),
  },
  {
    id: 'S1-1 CTE-wrapped LIMIT satisfies a LIMIT task',
    kind: 'CONTRACT',
    sql: 'WITH top3 AS (SELECT name, price FROM products ORDER BY price DESC LIMIT 3) SELECT name, price FROM top3;',
    validation: {
      targetTable: 'products',
      requireExactResult: true,
      requireOrderBy: [{ column: 'price', direction: 'DESC' }],
      requireLimit: 3,
      expectedRowCount: 3,
    },
    checkValid: (o) => (o.passed ? null : `identical dataset rejected: ${o.feedback}`),
  },
  {
    id: 'S2-4 extra ON condition must not be silently dropped',
    kind: 'CONTRACT',
    sql: "SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'no_such_status';",
    checkExec: (r) => {
      if (!r.success) return /ON|JOIN|support/i.test(String(r.error)) ? null : `unexpected error: ${r.error}`;
      return r.rowCount === 18 ? `extra ON condition dropped: joined all 18 order rows` : null;
    },
  },
  {
    id: 'S2-7 double-quoted LIKE pattern must not fire the Syntax Trap',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM products WHERE name LIKE "%SUM(%";',
    validation: { targetTable: 'products' },
    skipExec: true,
    checkValid: (o) => (/Syntax Trap/i.test(o.feedback) ? `false trap: ${o.feedback}` : null),
  },
  {
    id: 'S2-6 empty string is NOT NULL',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM customers WHERE city IS NULL;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      // Every customer has a city, so `city IS NULL` must return zero rows.
      // (Before S2-6, '' counted as NULL and would have matched rows.)
      return r.rowCount === 0 ? null : `'' treated as NULL: ${r.rowCount} row(s) matched`;
    },
  },
  {
    id: 'S3-9 LIKE metacharacters are literal, not regex',
    kind: 'CONTRACT',
    sql: "SELECT name FROM products WHERE name LIKE 'a.c';",
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      // No product name is literally 'a.c', and the pattern must NOT be treated
      // as the regex /^a.c$/ (which would match 'abc').
      return r.rowCount === 0 ? null : `LIKE pattern acted as regex: ${r.rowCount} row(s) matched`;
    },
  },
  {
    id: 'S3-10 GROUP BY unknown column errors instead of collapsing',
    kind: 'CONTRACT',
    sql: 'SELECT city, COUNT(*) FROM customers GROUP BY no_such_column;',
    checkExec: (r) =>
      !r.success
        ? /GROUP BY/i.test(String(r.error)) ? null : `wrong error: ${r.error}`
        : `silently collapsed ${r.rowCount} row(s) instead of erroring`,
  },
  {
    id: 'S3-10 GROUP BY positional key resolves (GROUP BY 1)',
    kind: 'CONTRACT',
    sql: 'SELECT city, COUNT(*) AS n FROM customers GROUP BY 1;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      const cities = new Set((r.rows ?? []).map((row: any) => row.city));
      return cities.size > 1 ? null : `GROUP BY 1 collapsed to ${cities.size} group(s)`;
    },
  },
  {
    id: 'S2-6 IS FALSE must not match non-boolean values',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM customers WHERE city IS FALSE;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      // No city is a boolean, so MySQL returns zero rows. (Before the fix this
      // matched every row that merely was not TRUE.)
      return r.rowCount === 0 ? null : `non-boolean matched IS FALSE: ${r.rowCount} row(s)`;
    },
  },
  {
    id: 'S1-2 comparison-shaped nonsense must error, not return 0 rows silently',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM products WHERE (price > 1) IS TRUE;',
    checkExec: (r) =>
      !r.success
        ? /unsupported where predicate/i.test(String(r.error)) ? null : `wrong error: ${r.error}`
        : `silently returned ${r.rowCount} row(s) instead of erroring`,
  },
  {
    id: 'B7 SELECT * exposes the table columns only (no internal mirrors)',
    kind: 'CONTRACT',
    sql: 'SELECT * FROM students;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      const dotted = (r.columns ?? []).filter((c: string) => c.includes('.'));
      if (dotted.length > 0) return `leaked internal mirror columns: ${dotted.join(', ')}`;
      return (r.columns ?? []).length === 5 ? null : `expected 5 columns, got ${(r.columns ?? []).length}`;
    },
  },
  {
    id: 'B7 CTE + SELECT * must not re-prefix the columns',
    kind: 'CONTRACT',
    sql: 'WITH _v AS (SELECT * FROM students) SELECT * FROM _v;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      const dotted = (r.columns ?? []).filter((c: string) => c.includes('.'));
      if (dotted.length > 0) return `leaked ${dotted.length} prefixed column(s): ${dotted.slice(0, 3).join(', ')}`;
      return (r.columns ?? []).length === 5 ? null : `expected 5 columns, got ${(r.columns ?? []).length}`;
    },
  },
  {
    id: 'B7 CTE + set operation keeps matching shapes',
    kind: 'CONTRACT',
    sql: "WITH c AS (SELECT name, 'customer' AS source FROM customers) SELECT * FROM c UNION ALL SELECT name, 'supplier' AS source FROM suppliers;",
    checkExec: (r) =>
      !r.success
        ? `CTE-wrapped SELECT * produced a shape mismatch: ${r.error}`
        : r.rowCount === 21
          ? null
          : `expected 21 rows, got ${r.rowCount}`,
  },
  {
    id: 'B7 ORDER BY a qualified name still resolves after stripping mirrors',
    kind: 'BASELINE',
    sql: 'SELECT * FROM products ORDER BY products.price DESC LIMIT 3;',
    checkExec: (r) => (!r.success ? `unexpected error: ${r.error}` : r.rowCount === 3 ? null : `expected 3 rows, got ${r.rowCount}`),
  },
  {
    id: 'B8 unaliased INNER JOIN must match (was 0 rows)',
    kind: 'CONTRACT',
    sql: 'SELECT c.name, o.order_id FROM customers JOIN orders ON customers.customer_id = orders.customer_id;',
    checkExec: (r) =>
      !r.success
        ? `unexpected error: ${r.error}`
        : r.rowCount === 18
          ? null
          : `unaliased JOIN returned ${r.rowCount} row(s), expected 18 (matching the aliased form)`,
  },
  {
    id: 'B8 unaliased LEFT JOIN must match (was an all-NULL right side)',
    kind: 'CONTRACT',
    sql: 'SELECT c.name, o.order_id FROM customers LEFT JOIN orders ON customers.customer_id = orders.customer_id;',
    checkExec: (r) => {
      if (!r.success) return `unexpected error: ${r.error}`;
      if (r.rowCount !== 21) return `expected 21 rows, got ${r.rowCount}`;
      const nullRight = (r.rows ?? []).filter((row: any) => row.order_id == null).length;
      // Only the 3 customers with no orders may have an unmatched (NULL) side.
      return nullRight === 3
        ? null
        : `${nullRight} NULL right sides — only the 3 order-less customers should be unmatched`;
    },
  },
  {
    id: 'B8 JOIN without an ON condition must error, not return an empty set',
    kind: 'CONTRACT',
    sql: 'SELECT COUNT(*) AS n FROM customers JOIN orders;',
    checkExec: (r) =>
      r.success ? `silently returned ${r.rowCount} row(s) for a JOIN with no ON condition` : null,
  },
  {
    id: 'B10 ORDER BY a projected aggregate must sort, not error',
    kind: 'CONTRACT',
    sql: 'SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY COUNT(*) DESC;',
    checkExec: (r) => {
      if (!r.success) return `valid MySQL errored: ${r.error}`;
      const vals = (r.rows ?? []).map((row: any) => Number(row.n));
      const desc = [...vals].sort((a, b) => b - a);
      return JSON.stringify(vals) === JSON.stringify(desc) ? null : `not sorted descending: ${JSON.stringify(vals)}`;
    },
  },
  {
    id: 'B10 ORDER BY an unprojected function expression must sort',
    kind: 'CONTRACT',
    sql: 'SELECT name FROM products ORDER BY UPPER(name) ASC;',
    checkExec: (r) => {
      if (!r.success) return `valid MySQL errored: ${r.error}`;
      const names = (r.rows ?? []).map((row: any) => String(row.name));
      const sorted = [...names].sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));
      return JSON.stringify(names) === JSON.stringify(sorted) ? null : 'UPPER(name) order not applied';
    },
  },
  {
    id: 'B10 an unresolvable ORDER BY key must still error',
    kind: 'BASELINE',
    sql: 'SELECT name FROM products ORDER BY no_such_column;',
    checkExec: (r) =>
      r.success ? 'silently returned rows for an unknown sort key' : null,
  },
  {
    id: 'BASE extra ON tautology keeps the plain join row set',
    kind: 'BASELINE',
    sql: 'SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id AND o.order_id + 0 = o.order_id;',
    checkExec: (r) => (!r.success ? `unexpected error: ${r.error}` : r.rowCount === 18 ? null : `expected 18 rows, got ${r.rowCount}`),
  },
  {
    id: 'BASE single-quoted LIKE trap immunity (P10.1)',
    kind: 'BASELINE',
    sql: "SELECT name FROM products WHERE name LIKE '%SUM(%';",
    validation: { targetTable: 'products' },
    skipExec: true,
    checkValid: (o) => (/Syntax Trap/i.test(o.feedback) ? `regression: ${o.feedback}` : null),
  },
];

let pass = 0;
let fail = 0;
const failures: string[] = [];

for (const p of probes) {
  const r = p.skipExec
    ? { success: true, columns: ['name'], rows: [{ name: 'x' }], rowCount: 1, executionTimeMs: 1 }
    : new SqlExecutor().executeQuery(p.sql);

  const problems: string[] = [];
  if (!p.skipExec && p.checkExec) {
    const e = p.checkExec(r);
    if (e) problems.push(`exec: ${e}`);
  }
  if (p.validation) {
    let expected: any = undefined;
    if (p.validation.requireExactResult && (r as any).success) {
      const expectedSql =
        p.expectedSql ??
        (p.id.indexOf('GROUP BY dedupe') !== -1
          ? 'SELECT DISTINCT city FROM customers;'
          : 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;');
      expected = new SqlExecutor().executeQuery(expectedSql);
    }
    const o = validateTaskSolution(p.sql, r as any, p.validation, expected);
    if (p.checkValid) {
      const v = p.checkValid(o, r);
      if (v) problems.push(`validate: ${v}`);
    }
  }
  if (problems.length === 0) {
    pass++;
    console.log(`  PASS [${p.kind}] ${p.id}`);
  } else {
    fail++;
    console.log(`  FAIL [${p.kind}] ${p.id}`);
    for (const d of problems) {
      console.log(`         ${d}`);
      failures.push(`${p.id} :: ${d}`);
    }
  }
}

console.log(`\n=== probe-equivalence: ${pass} pass / ${fail} fail ===`);
if (fail > 0) {
  console.log('Failing probes (the fix plan must turn each CONTRACT probe green):');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
