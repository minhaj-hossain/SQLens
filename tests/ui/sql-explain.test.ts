import { describe, it, expect } from 'vitest';
import { explainQuery } from '../../src/lib/sql-explain';
import { formatExecutionTime } from '../../src/lib/format-execution-time';

const joined = (sql: string) => explainQuery(sql).join(' ');

describe('sql-explain: SELECT coverage', () => {
  it('explains plain SELECT with WHERE / ORDER BY / LIMIT', () => {
    const s = joined('SELECT name, price FROM products WHERE price > 50 ORDER BY price DESC LIMIT 5;');
    expect(s).toContain("Reads data from table 'products'");
    expect(s).toContain('Filters records where condition (price > 50)');
    expect(s).toContain('Sorts results by price descending');
    expect(s).toContain('Limits output to at most 5');
    expect(s).toContain('Selects name, price');
  });

  it('explains a GROUP BY + HAVING aggregate query', () => {
    const s = joined(
      'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15;',
    );
    expect(s).toContain('the group average (AVG(price))');
    expect(s).toContain('Aggregates rows grouped by (category_id)');
    expect(s).toContain('Keeps only groups where (AVG(price) > 15)');
  });

  it('explains DISTINCT', () => {
    const s = joined('SELECT DISTINCT city FROM customers;');
    expect(s).toContain('Returns distinct rows');
    expect(s).toContain('Selects city');
  });

  it('explains a window function (Day 23 DENSE_RANK)', () => {
    const s = joined(
      'SELECT category_id, name, price, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS r FROM products;',
    );
    expect(s).toContain('the dense rank per row within its partition');
  });

  it('lists EVERY join in a multi-join query (Day 15)', () => {
    const s = joined(
      'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id LEFT JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
    );
    expect(s).toContain("Performs a LEFT JOIN with table 'orders'");
    expect(s).toContain("Performs a LEFT JOIN with table 'order_items'");
    expect(s).toContain('the count of rows per group');
  });
});

describe('sql-explain: non-SELECT coverage (Days 21-33)', () => {
  it('explains a CTE (Day 21) instead of misparsing the inner SELECT', () => {
    const s = joined(
      'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
    );
    expect(s).toContain('Defines a temporary result set (ActiveCustomers)');
    expect(s).toContain("an INNER JOIN with table 'ActiveCustomers'");
  });

  it('explains a guarded UPDATE (Day 25)', () => {
    const s = joined('UPDATE products SET price = price * 1.10 WHERE product_id = 1;');
    expect(s).toContain("Updates table 'products'");
    expect(s).toContain('Restricted by WHERE condition (product_id = 1)');
  });

  it('warns loudly on an unguarded UPDATE', () => {
    const s = joined('UPDATE products SET price = 19.99;');
    expect(s).toContain('Caution: no WHERE clause');
  });

  it('explains a DELETE with its guard', () => {
    const s = joined('DELETE FROM orders WHERE order_id = 18;');
    expect(s).toContain("Deletes records from table 'orders'");
    expect(s).toContain('Restricted by WHERE condition (order_id = 18)');
  });

  it('explains a multi-row INSERT (Day 26)', () => {
    const s = joined("INSERT INTO products (name, price) VALUES ('A', 1.0), ('B', 2.0), ('C', 3.0);");
    expect(s).toContain("Inserts 3 row(s) into table 'products'");
  });

  it('explains CREATE TABLE DDL (Day 27)', () => {
    const s = joined(
      'CREATE TABLE product_reviews (review_id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, rating INT);',
    );
    expect(s).toContain('Makes a schema change');
  });

  it('explains transaction commands (Day 26)', () => {
    expect(joined('BEGIN;')).toContain('Opens a transaction');
    expect(joined('COMMIT;')).toContain('Commits the open transaction');
    expect(joined('ROLLBACK;')).toContain('Rolls back the open transaction');
  });

  it('explains UNION set operations (Day 17)', () => {
    const s = joined('SELECT name FROM customers UNION SELECT name FROM suppliers ORDER BY name;');
    expect(s).toContain('Combines the results of two queries with UNION');
  });
});

describe('sql-explain: edge cases', () => {
  it('handles empty input', () => {
    expect(explainQuery('').join(' ')).toBe('No SQL query entered yet.');
    expect(explainQuery('   ').join(' ')).toBe('No SQL query entered yet.');
  });
});

describe('formatExecutionTime (tracker item 11)', () => {
  it('formats a real finite value with ms', () => {
    expect(formatExecutionTime(12.345)).toBe('12.3ms');
    expect(formatExecutionTime(0)).toBe('0.0ms');
  });
  it('never fabricates a number', () => {
    expect(formatExecutionTime(undefined)).toBeNull();
    expect(formatExecutionTime(NaN)).toBeNull();
    expect(formatExecutionTime(Infinity)).toBeNull();
  });
});