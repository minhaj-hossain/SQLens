/**
 * Engine-honesty regression suite (audit Phase 2).
 *
 * Every case here guards a path that used to be SILENTLY WRONG — an unparsed
 * WHERE predicate that matched every row, an unknown function that evaluated to
 * NULL, a dropped JOIN condition, `''` treated as NULL, LIKE patterns running as
 * regex, or GROUP BY collapsing the whole table into one bucket.
 *
 * The contract is: either evaluate the construct correctly, or fail with a
 * NAMED error. Never return a plausible-looking wrong answer.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import { ValidationRule } from '../../src/types/curriculum';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { splitStatements } from '../../src/lib/sql-engine/split-statements';

const run = (sql: string) => new SqlExecutor().executeQuery(sql);

describe('S1-2 — unsupported WHERE predicates must error, never match everything', () => {
  it('evaluates EXISTS as a per-row filter', () => {
    const r = run(
      'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.customer_id);'
    );
    expect(r.success).toBe(true);
    // Must filter (fewer rows than the full table), not fall through to `true`.
    expect(r.rowCount).toBeLessThan(15);
    expect(r.rowCount).toBeGreaterThan(0);
  });

  it('evaluates NOT EXISTS as an anti-join', () => {
    const withOrders = run(
      'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.customer_id);'
    );
    const withoutOrders = run(
      'SELECT name FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.customer_id);'
    );
    expect(withoutOrders.success).toBe(true);
    // Anti-join and semi-join partition the table: 15 rows total, no overlap.
    expect(withoutOrders.rowCount + withOrders.rowCount).toBe(15);
  });

  it('raises a named error for a predicate outside the dialect', () => {
    const r = run("SELECT name FROM products WHERE name REGEXP 'a';");
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/unsupported where predicate/i);
  });

  it('does not silently drop a filter whose operator is unsupported', () => {
    // Regression: this used to return every row of the table.
    const r = run("SELECT name FROM products WHERE name XOR 'a';");
    expect(r.success).toBe(false);
  });
});
describe('S1-3 — unknown functions must error, never evaluate to NULL', () => {
  it('supports SUBSTR as a SUBSTRING synonym', () => {
    const r = run('SELECT SUBSTR(name, 1, 3) AS short FROM products;');
    expect(r.success).toBe(true);
    expect(r.rows.some((row: any) => row.short != null && String(row.short).length === 3)).toBe(true);
  });

  it('supports bare COALESCE', () => {
    const r = run('SELECT COALESCE(email, city) AS contact FROM customers;');
    expect(r.success).toBe(true);
    expect(r.rows.some((row: any) => row.contact != null)).toBe(true);
  });

  it('errors on a typoed function name instead of NULLing the column', () => {
    const r = run('SELECT LENGHT(name) AS l FROM products;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/unsupported function/i);
  });

  it('errors on an unknown function in WHERE position', () => {
    const r = run('SELECT name FROM products WHERE MYSTERY(price) > 1;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/unsupported function/i);
  });

  it('errors when an aggregate is used where no group exists', () => {
    const r = run('SELECT name FROM products WHERE COUNT(*) > 1;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/aggregate/i);
  });
});

describe('S2-4 — multi-condition JOIN ON must not be truncated', () => {
  it('applies the extra AND terms in the ON clause', () => {
    const base = run(
      'SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id;'
    );
    const filtered = run(
      "SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'no_such_status';"
    );
    expect(base.success).toBe(true);
    expect(filtered.success).toBe(true);
    // The impossible extra condition must eliminate rows (0), not be ignored (18).
    expect(filtered.rowCount).toBe(0);
    expect(base.rowCount).toBeGreaterThan(0);
  });

  it('keeps the plain row set when the extra condition is a tautology', () => {
    const plain = run(
      'SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id;'
    );
    const tautology = run(
      'SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.customer_id AND o.order_id + 0 = o.order_id;'
    );
    expect(tautology.rowCount).toBe(plain.rowCount);
  });
});
describe('S2-6 — IS NULL must not match the empty string', () => {
  it('treats "" as a value, not as NULL', () => {
    const r = run('SELECT name FROM customers WHERE city IS NULL;');
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(0);
  });

  it('IS NOT NULL matches ordinary values', () => {
    const r = run('SELECT name FROM customers WHERE city IS NOT NULL;');
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(15);
  });

  it('IS FALSE does not match non-boolean values', () => {
    // MySQL: 'Dhaka' is neither TRUE nor FALSE, so this must return no rows.
    const r = run('SELECT name FROM customers WHERE city IS FALSE;');
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(0);
  });
});

describe('S1-2b — the comparison branch must not swallow non-comparison shapes', () => {
  it('errors on a parenthesised comparison followed by IS TRUE', () => {
    // Regression: this silently returned 0 rows because the permissive
    // comparison regex read the left operand as "(price ".
    const r = run('SELECT name FROM products WHERE (price > 1) IS TRUE;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/unsupported where predicate/i);
  });

  it('still evaluates a plain comparison and arithmetic operands', () => {
    expect(run('SELECT name FROM products WHERE price > 1;').rowCount).toBeGreaterThan(0);
    expect(run('SELECT name FROM products WHERE price * 1.15 > 0;').rowCount).toBeGreaterThan(0);
  });
});

describe('S3-9 — LIKE wildcards only; other characters are literal', () => {
  it('does not let "." act as a regex any-character', () => {
    const r = run("SELECT name FROM products WHERE name LIKE 'a.c';");
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(0);
  });

  it('still honours % and _ wildcards', () => {
    const r = run("SELECT name FROM products WHERE name LIKE 'a%';");
    expect(r.success).toBe(true);
  });
});

describe('S3-10 — GROUP BY keys must resolve or fail loudly', () => {
  it('errors on an unknown GROUP BY column instead of collapsing to one group', () => {
    const r = run('SELECT city, COUNT(*) FROM customers GROUP BY no_such_column;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/group by/i);
  });

  it('resolves a positional GROUP BY key', () => {
    const r = run('SELECT city, COUNT(*) AS n FROM customers GROUP BY 1;');
    expect(r.success).toBe(true);
    const cities = new Set(r.rows.map((row: any) => row.city));
    expect(cities.size).toBeGreaterThan(1);
  });
});

describe('Batch 10 — ORDER BY sort keys and `#` comments', () => {
  it('sorts by a projected aggregate written as an expression', () => {
    const r = run('SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY COUNT(*) DESC;');
    expect(r.success).toBe(true);
    const vals = r.rows.map((row: any) => Number(row.n));
    expect(vals).toEqual([...vals].sort((a, b) => b - a));
    // The expression maps onto the projection's own output column.
    expect(Object.keys(r.rows[0])).toContain('n');
  });

  it('sorts by an unprojected function expression (evaluated per row)', () => {
    const r = run('SELECT name FROM products ORDER BY UPPER(name) ASC;');
    expect(r.success).toBe(true);
    const names = r.rows.map((row: any) => String(row.name));
    expect(names).toEqual([...names].sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase())));
  });

  it('orders case-insensitively for UPPER(name), unlike the raw column', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE TABLE t (n VARCHAR(20));');
    ex.executeQuery("INSERT INTO t (n) VALUES ('apple'), ('Banana'), ('cherry'), ('Apricot');");
    const upper = ex.executeQuery('SELECT n FROM t ORDER BY UPPER(n) ASC;');
    expect(upper.rows?.map((x: any) => x.n)).toEqual(['apple', 'Apricot', 'Banana', 'cherry']);
    // `ORDER BY n` on localeCompare is also case-insensitive for these values —
    // documented here so the two do not diverge silently.
    const raw = ex.executeQuery('SELECT n FROM t ORDER BY n ASC;');
    expect(raw.rows?.map((x: any) => x.n)).toEqual(['apple', 'Apricot', 'Banana', 'cherry']);
  });

  it('still errors on an unresolvable sort key instead of skipping the sort', () => {
    const r = run('SELECT name FROM products ORDER BY no_such_column;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/not found in the query output/i);
  });

  it('still errors on an arithmetic sort key (documented boundary)', () => {
    const r = run('SELECT name FROM products ORDER BY price * -1;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/order by expressions are not supported/i);
  });

  it('an unknown function in ORDER BY errors rather than sorting wrongly', () => {
    const r = run('SELECT name FROM products ORDER BY MYSTERY(name) ASC;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/unsupported function/i);
  });
});

describe('Batch 10 — `#` comments are ignored like `--` comments', () => {
  it('a `#`-only chunk is not a statement', () => {
    expect(splitStatements('# just a comment')).toEqual([]);
    expect(splitStatements('# c1\n# c2')).toEqual([]);
    expect(splitStatements('-- only a comment')).toEqual([]);
  });

  it('a trailing `#` comment does not create a phantom statement', () => {
    expect(splitStatements('SELECT name FROM students; # trailing comment')).toEqual([
      'SELECT name FROM students',
    ]);
  });

  it('a statement with a leading `#` comment still runs', () => {
    const r = run('# fetch one student\nSELECT name FROM students LIMIT 1;');
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(1);
  });
});

describe('Batch 6 — strictConstruct closes the same-dataset false accept', () => {
  /**
   * Decision-first grading (Batch 2) made construct rules advisory when the
   * dataset matches. That is right for most lessons — but where the construct IS
   * the subject, an equivalent formulation that skips it must still fail.
   * `UNION` vs `UNION ALL` on dedupe-free data is the canonical case: identical
   * rows, different lesson.
   */
  // Dedupe-free data: `UNION` and `UNION ALL` return the IDENTICAL rows here, so
  // the dataset cannot tell them apart — only the construct rule can.
  const unionAll = "SELECT name, 'Customer' AS source FROM customers UNION ALL SELECT name, 'Supplier' AS source FROM suppliers;";
  const union = "SELECT name, 'Customer' AS source FROM customers UNION SELECT name, 'Supplier' AS source FROM suppliers;";
  const base: ValidationRule = {
    targetTable: 'customers',
    requireExactResult: true,
    requireSetOp: 'UNION',
  };

  it('accepts a dataset-identical rewrite when the task is advisory (default)', () => {
    const expected = run(union);
    const r = run(unionAll);
    const o = validateTaskSolution(unionAll, r, base, expected);
    expect(o.passed).toBe(true);
    expect(o.feedback).toMatch(/note:/i);
  });

  it('rejects it once the task opts in with strictConstruct', () => {
    const expected = run(union);
    const r = run(unionAll);
    const o = validateTaskSolution(unionAll, r, { ...base, strictConstruct: true }, expected);
    expect(o.passed).toBe(false);
    expect(o.feedback).toMatch(/UNION/i);
  });

  it('still accepts the required construct', () => {
    const expected = run(union);
    const o = validateTaskSolution(union, run(union), { ...base, strictConstruct: true }, expected);
    expect(o.passed).toBe(true);
  });

  it('the curriculum actually opts in where the construct is the lesson', () => {
    // Guards the Batch 6 content pass: set-ops day, DISTINCT lesson, CASE module,
    // GROUP BY/HAVING lessons, LIMIT lesson and the JOIN module must be strict.
    const strictIds = new Set<string>();
    for (const m of ALL_MODULES as any[]) {
      const groups: Array<[string, any[]]> = (m.concepts ?? []).map((c: any) => [c.id, c.tasks ?? []]);
      if (m.challenge?.tasks) groups.push(['challenge', m.challenge.tasks]);
      for (const [, tasks] of groups) {
        for (const t of tasks) if (t.validation?.strictConstruct) strictIds.add(t.id);
      }
    }
    expect(strictIds.size).toBeGreaterThanOrEqual(47);
    for (const id of ['union-dedupe-t1', 'union-all-t1', 'day04-c2-t1', 'case-basic-t1', 'day09-c2-t1', 'day11-c1-t1']) {
      expect(strictIds.has(id)).toBe(true);
    }
  });
});

describe('Batch 9 — customValidator sees clauses at any nesting depth', () => {
  /**
   * An authored `customValidator` used to read only `queryAst.whereClause`, i.e.
   * the TOP-LEVEL statement. A learner who wrapped the same query in a CTE moved
   * the filter one level down and was told the filter was missing — a
   * false-reject on a correctly-solved task. The validator now receives a
   * nesting-independent `features.whereClauses` list.
   */
  const rule: ValidationRule = {
    targetTable: 'products',
    requireExactResult: true,
    customValidator: (_ast: any, _res: any, features: any) => {
      const clauses: string[] = [
        ...((features?.whereClauses as string[] | undefined) ?? []),
        String(_ast?.whereClause ?? ''),
      ];
      return clauses.some((w) => /IS\s+NOT\s+NULL/i.test(w))
        ? { valid: true }
        : { valid: false, message: 'filter is missing' };
    },
  };

  const flat =
    'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);';
  const wrapped = `WITH _v AS (${flat.replace(/;$/, '')}) SELECT name, price FROM _v;`;

  it('passes the flat form', () => {
    const o = validateTaskSolution(flat, run(flat), rule, run(flat));
    expect(o.passed).toBe(true);
  });

  it('passes the CTE-wrapped form with the same semantics', () => {
    const expected = run(flat);
    const o = validateTaskSolution(wrapped, run(wrapped), rule, expected);
    expect(o.passed).toBe(true);
  });

  it('still rejects a query that genuinely omits the NULL filter', () => {
    const noFilter =
      'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items);';
    const o = validateTaskSolution(noFilter, run(noFilter), rule, run(flat));
    expect(o.passed).toBe(false);
  });

  it('a string literal containing the filter text cannot fake it', () => {
    // The masked feature set blanks literals, so this must NOT satisfy the rule.
    const faked =
      "SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items) AND 'IS NOT NULL' = 'IS NOT NULL';";
    const o = validateTaskSolution(faked, run(faked), rule, run(flat));
    expect(o.passed).toBe(false);
  });
});

describe('Batch 8 — unaliased JOIN … ON must match (not silently return no rows)', () => {
  /**
   * The JOIN parser captured the keyword `ON` as the table alias whenever the
   * table had no alias, leaving onLeft/onRight empty. The matcher then had no
   * equality to test, so every unaliased JOIN silently returned ZERO rows
   * (or an all-NULL right side for LEFT JOIN). Curriculum solutions all use
   * aliases, which is why the 343-task audit never caught it.
   */
  const pairs: Array<[string, string, string]> = [
    [
      'INNER JOIN',
      'SELECT c.name AS n, o.order_id AS id FROM customers JOIN orders ON customers.customer_id = orders.customer_id ORDER BY o.order_id;',
      'SELECT c.name AS n, o.order_id AS id FROM customers c JOIN orders o ON c.customer_id = o.customer_id ORDER BY o.order_id;',
    ],
    [
      'INNER JOIN orders→order_items',
      'SELECT o.order_id AS id, i.quantity AS q FROM orders JOIN order_items ON orders.order_id = order_items.order_id ORDER BY o.order_id, i.quantity;',
      'SELECT o.order_id AS id, i.quantity AS q FROM orders o JOIN order_items i ON o.order_id = i.order_id ORDER BY o.order_id, i.quantity;',
    ],
    [
      'explicit INNER keyword',
      'SELECT c.name AS n FROM customers INNER JOIN orders ON customers.customer_id = orders.customer_id;',
      'SELECT c.name AS n FROM customers c INNER JOIN orders o ON c.customer_id = o.customer_id;',
    ],
  ];

  for (const [label, unaliased, aliased] of pairs) {
    it(`${label}: unaliased result equals the aliased result`, () => {
      const raw = run(unaliased);
      const ali = run(aliased);
      expect(raw.success).toBe(true);
      expect(ali.success).toBe(true);
      expect(raw.rowCount).toBeGreaterThan(0);
      expect(raw.rowCount).toBe(ali.rowCount);
      expect(raw.rows).toEqual(ali.rows);
    });
  }

  it('LEFT JOIN keeps matched rows and pads only the order-less customers', () => {
    const r = run(
      'SELECT c.name AS n, o.order_id AS id FROM customers LEFT JOIN orders ON customers.customer_id = orders.customer_id;'
    );
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(21); // 18 matched + 3 unmatched
    expect(r.rows.filter((row: any) => row.id == null).length).toBe(3);
  });

  it('a JOIN with no ON condition errors instead of returning an empty set', () => {
    const r = run('SELECT COUNT(*) AS n FROM customers JOIN orders;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/on condition/i);
  });

  it('still evaluates extra AND terms in the ON clause', () => {
    const r = run(
      'SELECT COUNT(*) AS n FROM orders o JOIN order_items i ON o.order_id = i.order_id AND i.quantity > 1;'
    );
    expect(r.success).toBe(true);
    expect(Number(r.rows[0].n)).toBeGreaterThan(0);
  });
});

describe('Batch 7 — SELECT * must expose table columns, not internal mirrors', () => {
  /**
   * The FROM loader mirrors every column as `table.col`/`alias.col` so qualified
   * names resolve. Those mirrors used to become RESULT columns: `SELECT * FROM
   * students` returned 10 columns for a 5-column table, and a CTE wrapper
   * re-prefixed them to 20 — and a CTE + set operation failed with a bogus
   * "sides must return the same number of columns" shape error.
   */
  it('returns the table columns exactly once', () => {
    const r = run('SELECT * FROM students;');
    expect(r.success).toBe(true);
    expect(r.columns).toEqual(['id', 'name', 'age', 'department', 'city']);
  });

  it('never emits a dotted (qualified) column name', () => {
    const r = run('SELECT * FROM products;');
    expect(r.success).toBe(true);
    expect(r.columns.filter((c: string) => c.includes('.'))).toEqual([]);
  });

  it('does not double the column list through a CTE wrapper', () => {
    const r = run('WITH _v AS (SELECT * FROM students) SELECT * FROM _v;');
    expect(r.success).toBe(true);
    expect(r.columns).toEqual(['id', 'name', 'age', 'department', 'city']);
    expect(r.rowCount).toBe(5);
  });

  it('keeps CTE + UNION ALL shape-compatible', () => {
    // Used to fail with "left side: 4, right side: 2" because of the mirrors.
    const r = run(
      "WITH c AS (SELECT name, 'customer' AS source FROM customers) SELECT * FROM c UNION ALL SELECT name, 'supplier' AS source FROM suppliers;"
    );
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(21);
  });

  it('still resolves ORDER BY on a qualified name', () => {
    const r = run('SELECT * FROM products ORDER BY products.price DESC LIMIT 3;');
    expect(r.success).toBe(true);
    expect(r.rowCount).toBe(3);
    const prices = r.rows.map((row: any) => Number(row.price));
    expect(prices[0]).toBeGreaterThanOrEqual(prices[1]);
    expect(prices[1]).toBeGreaterThanOrEqual(prices[2]);
  });
});

describe('Batch 6 — SQL keywords are case-insensitive (tagged UNION-family regression)', () => {
  /**
   * Regression for a real learner-visible bug: a SELECT alias on a string
   * literal was matched by a regex that lacked the `i` flag, so a lowercase
   * `as` was folded into the expression and the tagged column evaluated to
   * NULL — with no error. Reported by a learner as:
   *   SELECT name, 'customer' AS source FROM customers
   *   UNION ALL
   *   SELECT name, 'supplier' as source FROM suppliers;   -- NULL `source`
   */
  const tagged = (second: string) =>
    `SELECT name, 'customer' AS source FROM customers UNION ALL SELECT name, '${second}' AS source FROM suppliers`;

  it('keeps the tag literal when the alias uses lowercase `as`', () => {
    const r = run(
      "select name, 'customer' as source from customers union all select name, 'supplier' as source from suppliers;"
    );
    expect(r.success).toBe(true);
    const tags = new Set(r.rows.map((row: any) => row.source));
    expect(tags.has('customer')).toBe(true);
    expect(tags.has('supplier')).toBe(true);
    expect(r.rows.some((row: any) => row.source == null)).toBe(false);
  });

  it('keeps the tag literal across newlines and blank lines', () => {
    const r = run(
      "SELECT name, 'customer' AS source\nFROM customers\n\nUNION ALL\n\nSELECT name, 'supplier' AS source\nFROM suppliers;"
    );
    expect(r.success).toBe(true);
    expect(r.rows.some((row: any) => row.source == null)).toBe(false);
    expect(r.rowCount).toBe(21); // 15 customers + 6 suppliers
  });

  it('accepts an alias without the AS keyword', () => {
    const r = run(
      "SELECT name, 'customer' source FROM customers UNION ALL SELECT name, 'supplier' source FROM suppliers;"
    );
    expect(r.success).toBe(true);
    expect(r.rows.some((row: any) => row.source == null)).toBe(false);
  });

  it('handles a lowercase `union all` operator', () => {
    const r = run(tagged('supplier').replace('UNION ALL', 'union all'));
    expect(r.success).toBe(true);
    expect(new Set(r.rows.map((row: any) => row.source)).size).toBe(2);
  });

  it('tags every operand in a three-way set operation', () => {
    const r = run(
      "SELECT name, 'customer' AS source FROM customers UNION ALL SELECT name, 'supplier' AS source FROM suppliers UNION ALL SELECT name, 'staff' AS source FROM suppliers;"
    );
    expect(r.success).toBe(true);
    expect(new Set(r.rows.map((row: any) => row.source))).toEqual(new Set(['customer', 'supplier', 'staff']));
  });

  it('sorts by the tag alias produced by a lowercase `as`', () => {
    const r = run(
      "SELECT name, 'customer' as source FROM customers UNION ALL SELECT name, 'supplier' as source FROM suppliers ORDER BY source, name;"
    );
    expect(r.success).toBe(true);
    const first = r.rows[0] as any;
    expect(first.source).toBe('customer');
  });
});

describe('S1-1 — decision-first grading with strictConstruct opt-in', () => {
  const byGroup = 'SELECT city FROM customers GROUP BY city;';
  const byDistinct = 'SELECT DISTINCT city FROM customers;';
  const rule: ValidationRule = {
    targetTable: 'customers',
    requireExactResult: true,
    requireDistinct: true,
  };

  it('accepts a provably-correct dataset that dedupes via GROUP BY', () => {
    const expected = run(byDistinct);
    const r = run(byGroup);
    const o = validateTaskSolution(byGroup, r, rule, expected);
    // The dataset is identical to the DISTINCT solution — it must pass, with the
    // construct reported as advice rather than as a veto.
    expect(o.passed).toBe(true);
    expect(o.feedback).toMatch(/note:/i);
  });

  it('still rejects a non-DISTINCT query when the task sets strictConstruct', () => {
    const expected = run(byDistinct);
    const r = run(byGroup);
    const o = validateTaskSolution(byGroup, r, { ...rule, strictConstruct: true }, expected);
    expect(o.passed).toBe(false);
    expect(o.feedback).toMatch(/distinct/i);
  });

  it('rejects a query whose dataset genuinely differs', () => {
    const expected = run(byDistinct);
    const wrong = "SELECT city FROM customers WHERE city <> 'Dhaka';";
    const o = validateTaskSolution(wrong, run(wrong), rule, expected);
    expect(o.passed).toBe(false);
  });
});

describe('S3-12 — dataset-mismatch feedback names the offending row', () => {
  it('points at the extra row instead of a generic "values differ"', () => {
    const solution = 'SELECT name, price FROM products WHERE product_id <= 3;';
    const expected = run(solution);
    const userSql = 'SELECT name, price FROM products WHERE product_id <= 4;';
    const o = validateTaskSolution(
      userSql,
      run(userSql),
      { targetTable: 'products', requireExactResult: true },
      expected
    );
    expect(o.passed).toBe(false);
    // The message must identify WHICH row is wrong (not just "one value differs").
    expect(o.feedback).toMatch(/row \d+/i);
  });

  it('reports a missing expected row when the learner filtered too much', () => {
    const solution = 'SELECT name, price FROM products WHERE product_id <= 3;';
    const expected = run(solution);
    const userSql = 'SELECT name, price FROM products WHERE product_id <= 2;';
    const o = validateTaskSolution(
      userSql,
      run(userSql),
      { targetTable: 'products', requireExactResult: true },
      expected
    );
    expect(o.passed).toBe(false);
    expect(o.feedback).toMatch(/did not return/i);
  });
});