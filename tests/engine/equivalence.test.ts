/**
 * P10.5 — Approach-fair grading ("multiple ways to solve a task").
 *
 * Every solution here is validated against its own exact-result output, then a
 * set of SEMANTICALLY EQUIVALENT variants must produce the same PASS verdict
 * (operator aliases, IN vs OR, BETWEEN vs range, case/formatting, alias
 * renames, column aliasing, positional ORDER BY...). Deliberately-wrong
 * variants must FAIL. This enforces that valid alternative approaches are never
 * rejected and content-blind false-accepts stay dead.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import {
  validateTaskSolution,
  isReadOnlySelect,
} from '../../src/lib/sql-engine/validator';
import { ValidationRule } from '../../src/types/curriculum';

interface Case {
  solution: string;
  validation: ValidationRule;
  variants: string[];
  wrong: string[];
}

function assertApproachFair(c: Case) {
  const ex = new SqlExecutor();
  const expected = ex.executeQuery(c.solution);
  expect(expected.success, `solution must run: ${c.solution}`).toBe(true);
  expect(isReadOnlySelect(c.solution)).toBe(true);

  const self = validateTaskSolution(c.solution, expected, c.validation, expected);
  expect(self.passed, `solution must pass itself: ${self.feedback}`).toBe(true);

  for (const v of c.variants) {
    const r = new SqlExecutor().executeQuery(v);
    const o = validateTaskSolution(v, r, c.validation, expected);
    expect(o.passed, `equivalent variant must PASS: ${v} — ${o.feedback}`).toBe(true);
  }

  for (const w of c.wrong) {
    const r = new SqlExecutor().executeQuery(w);
    const o = validateTaskSolution(w, r, c.validation, expected);
    expect(o.passed, `wrong variant must FAIL: ${w}`).toBe(false);
  }
}

describe('approach-fair grading (P10.5)', () => {
  it('operator equivalence + column aliasing (simple select)', () => {
    assertApproachFair({
      solution: 'SELECT name, price FROM products;',
      validation: { targetTable: 'products', requireExactResult: true },
      variants: [
        'select name, price from products;',
        'SELECT  name,  price   FROM products;',
        'SELECT products.name AS product_name, products.price AS unit_price FROM products;',
      ],
      wrong: [
        'SELECT name FROM products;',
        'SELECT name, price FROM products WHERE price > 100;',
        'SELECT name, category_id FROM products;',
      ],
    });
  });

  it('!= vs <> equivalence', () => {
    assertApproachFair({
      solution: 'SELECT name FROM products WHERE supplier_id != 1;',
      validation: { targetTable: 'products', requireExactResult: true },
      variants: [
        'SELECT name FROM products WHERE supplier_id <> 1;',
        'select name from products where supplier_id != 1;',
      ],
      wrong: ['SELECT name FROM products WHERE supplier_id = 1;'],
    });
  });

  it('IN vs OR chain equivalence', () => {
    assertApproachFair({
      solution: 'SELECT name FROM products WHERE category_id IN (1, 2);',
      validation: { targetTable: 'products', requireExactResult: true },
      variants: [
        'SELECT name FROM products WHERE category_id = 1 OR category_id = 2;',
        'SELECT name FROM products WHERE category_id IN ( 1 , 2 );',
      ],
      wrong: ['SELECT name FROM products WHERE category_id IN (1, 3);'],
    });
  });

  it('BETWEEN vs compound-range equivalence', () => {
    assertApproachFair({
      solution: 'SELECT name FROM products WHERE price BETWEEN 50 AND 100;',
      validation: { targetTable: 'products', requireExactResult: true },
      variants: [
        'SELECT name FROM products WHERE price >= 50 AND price <= 100;',
        'select name from products where price between 50 and 100;',
      ],
      wrong: [
        'SELECT name, price, category_id FROM products WHERE price BETWEEN 50 AND 100;',
      ],
    });
  });

  it('join alias rename + INNER keyword equivalence', () => {
    assertApproachFair({
      solution: 'SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.customer_id;',
      validation: { targetTable: 'customers', requireExactResult: true },
      variants: [
        'SELECT cu.name FROM customers cu INNER JOIN orders od ON od.customer_id = cu.customer_id;',
        'select c.name from customers c join orders o on o.customer_id = c.customer_id;',
      ],
      wrong: [
        "SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.status = 'cancelled';",
      ],
    });
  });

  it('ORDER BY: positional and case-insensitive equivalence, wrong order fails', () => {
    assertApproachFair({
      solution: 'SELECT name, price FROM products ORDER BY price DESC;',
      validation: {
        targetTable: 'products',
        requireExactResult: true,
        requireOrderBy: [{ column: 'price', direction: 'DESC' }],
      },
      variants: [
        'SELECT name, price FROM products ORDER BY 2 DESC;',
        'select name, price from products order by price desc;',
      ],
      wrong: [
        'SELECT name, price FROM products ORDER BY price ASC;',
        'SELECT name, price FROM products;',
      ],
    });
  });

  it('GROUP BY / HAVING with aggregate alias tolerance', () => {
    assertApproachFair({
      solution: 'SELECT city, COUNT(*) AS cnt FROM customers GROUP BY city HAVING COUNT(*) > 1;',
      validation: { targetTable: 'customers', requireExactResult: true, requireGroupBy: true },
      variants: [
        'select city, count(*) cnt from customers group by city having count(*) > 1;',
      ],
      wrong: [
        'SELECT city, COUNT(*) AS cnt FROM customers GROUP BY city HAVING COUNT(*) > 5;',
      ],
    });
  });

  it('P10.1: aggregate-inside-string and cross-column comparisons are not false traps', () => {
    // These validate the TRAP-CHECK layer specifically (the strictness of the
    // monkey not being tripped by a string literal / a valid column compare),
    // so we feed a fabricated successful result rather than requiring the
    // engine to evaluate the (possibly pattern-heavy) query.
    const ok = {
      success: true,
      columns: ['name'],
      rows: [{ name: 'x' }],
      rowCount: 1,
      executionTimeMs: 1,
    } as any;

    // '%SUM(%' lives INSIDE a string literal — must not trigger the aggregate-in-WHERE trap.
    const out1 = validateTaskSolution("SELECT name FROM products WHERE name LIKE '%SUM(%';", ok, {
      targetTable: 'products',
    });
    expect(out1.passed).toBe(true);
    expect(out1.feedback).not.toMatch(/Syntax Trap/i);

    // column = column comparison (no quotes needed) — must not trigger Quote Reminder.
    const out2 = validateTaskSolution('SELECT name FROM customers WHERE name = email;', ok, {
      targetTable: 'customers',
    });
    expect(out2.passed).toBe(true);
    // An actually-unquoted literal still gets caught.
    const out3 = validateTaskSolution("SELECT name FROM customers WHERE email = noquote;", ok, {
      targetTable: 'customers',
    });
    expect(out3.passed).toBe(false);
  });

  it('P10.2: positional ORDER BY out of range and expressions error clearly', () => {
    const ex = new SqlExecutor();
    const r1 = ex.executeQuery('SELECT name, price FROM products ORDER BY 5;');
    expect(r1.success).toBe(false);
    expect(String(r1.error)).toMatch(/out of range/i);

    const ex2 = new SqlExecutor();
    const r2 = ex2.executeQuery('SELECT name, price FROM products ORDER BY price * -1;');
    expect(r2.success).toBe(false);
    expect(String(r2.error)).toMatch(/expressions are not supported/i);
  });
});