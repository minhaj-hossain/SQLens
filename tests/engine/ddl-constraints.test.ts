import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

/**
 * DDL constraint engine (batch 12 — bookstore capstone prereq):
 *   - CREATE TABLE registers a per-executor schema + constraint metadata
 *   - AUTO_INCREMENT assigns sequential PKs on omitted INSERT
 *   - NOT NULL / UNIQUE / DEFAULT / CHECK / FOREIGN KEY are enforced on INSERT
 *   - DROP TABLE truly removes the table (data + schema + metadata + indexes)
 *   - seed-state leaks nothing across executor instances
 */
describe('DDL constraint engine', () => {
  function setup(): SqlExecutor {
    const ex = new SqlExecutor();
    ex.executeQuery('DROP TABLE IF EXISTS sales;');
    ex.executeQuery('DROP TABLE IF EXISTS books;');
    ex.executeQuery('DROP TABLE IF EXISTS authors;');
    ex.executeQuery('DROP TABLE IF EXISTS publishers;');
    ex.executeQuery(
      'CREATE TABLE publishers (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE);'
    );
    ex.executeQuery('CREATE TABLE authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);');
    ex.executeQuery(
      "CREATE TABLE books (book_id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200) NOT NULL, author_id INT NOT NULL, publisher_id INT NOT NULL, genre VARCHAR(50) NOT NULL, price DECIMAL(8,2) NOT NULL CHECK (price >= 0), quantity_in_stock INT NOT NULL DEFAULT 0, FOREIGN KEY (author_id) REFERENCES authors(author_id), FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id));"
    );
    ex.executeQuery(
      "CREATE TABLE sales (sale_id INT PRIMARY KEY AUTO_INCREMENT, book_id INT NOT NULL, sale_date DATE NOT NULL, quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(8,2) NOT NULL, FOREIGN KEY (book_id) REFERENCES books(book_id));"
    );
    return ex;
  }

  it('AUTO_INCREMENT assigns sequential ids across parent tables', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO authors (name) VALUES ('John Doe'), ('Jane Roe');");
    const r = ex.executeQuery('SELECT author_id, name FROM authors ORDER BY author_id;');
    expect(r.rowCount).toBe(2);
    expect(r.rows[0].author_id).toBe(1);
    expect(r.rows[1].author_id).toBe(2);
  });

  it('AUTO_INCREMENT respects an explicitly supplied id', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO authors (author_id, name) VALUES (10, 'Zed');");
    ex.executeQuery("INSERT INTO authors (name) VALUES ('Auto');");
    const r = ex.executeQuery('SELECT author_id, name FROM authors ORDER BY author_id;');
    expect(r.rows[1].author_id).toBe(11);
  });

  it('seed data does not leak between executor instances (schemas deep-cloned)', () => {
    const ex1 = setup();
    ex1.executeQuery('ALTER TABLE books ADD COLUMN status VARCHAR(20) DEFAULT \'active\';');
    const ex2 = new SqlExecutor();
    const schemas = ex2.getDatabaseState().schemas;
    expect(schemas['books']).toBeUndefined();
  });

  it('NOT NULL rejects a missing required column', () => {
    const ex = setup();
    const r = ex.executeQuery("INSERT INTO authors (author_id) VALUES (1);");
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/cannot be null/i);
  });

  it('UNIQUE rejects a duplicate publisher name', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO publishers (name) VALUES ('Hachette');");
    const r = ex.executeQuery("INSERT INTO publishers (name) VALUES ('Hachette');");
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Duplicate entry/i);
  });

  it('CHECK rejects a negative price', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO authors (name) VALUES ('Author');");
    ex.executeQuery("INSERT INTO publishers (name) VALUES ('Pub');");
    const r = ex.executeQuery(
      "INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Bad', 1, 1, 'X', -5, 1);"
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/CHECK constraint violated/i);
  });

  it('CHECK accepts a valid row and DEFAULT fills quantity_in_stock', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO authors (name) VALUES ('Author');");
    ex.executeQuery("INSERT INTO publishers (name) VALUES ('Pub');");
    const r = ex.executeQuery(
      "INSERT INTO books (title, author_id, publisher_id, genre, price) VALUES ('Good', 1, 1, 'X', 10);"
    );
    expect(r.success).toBe(true);
    const books = ex.executeQuery("SELECT * FROM books WHERE title = 'Good';");
    expect(books.rows[0].quantity_in_stock).toBe(0); // DEFAULT 0
  });

  it('FOREIGN KEY rejects an orphan child row', () => {
    const ex = setup();
    const r = ex.executeQuery(
      "INSERT INTO books (title, author_id, publisher_id, genre, price) VALUES ('Orphan', 999, 1, 'X', 10);"
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/foreign key constraint fails/i);
  });

  it('chained parent→child inserts + a 3-way join see the AUTO_INCREMENT keys', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO publishers (name) VALUES ('Hachette'), ('Scholastic');");
    ex.executeQuery("INSERT INTO authors (name) VALUES ('John Doe'), ('Jane Roe');");
    ex.executeQuery(
      "INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Learning SQL', 1, 1, 'Programming', 19.99, 5), ('SQL Deep Dive', 2, 2, 'Programming', 24.99, 0);"
    );
    ex.executeQuery("INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-08-10', 2, 19.99), (2, '2026-08-15', 1, 24.99);");
    const r = ex.executeQuery(
      "SELECT b.title, a.name AS author, p.name AS publisher FROM books b JOIN authors a ON b.author_id = a.author_id JOIN publishers p ON b.publisher_id = p.publisher_id ORDER BY b.book_id;"
    );
    expect(r.rowCount).toBe(2);
    expect(r.rows[0].author).toBe('John Doe');
  });

  it('DROP TABLE removes data + schema + metadata so CREATE works fresh', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO authors (name) VALUES ('X');");
    ex.executeQuery('DROP TABLE IF EXISTS authors;');
    const missing = ex.executeQuery('SELECT * FROM authors;');
    expect(missing.success).toBe(false);
    // Re-create the same name now succeeds (dropped state, not "already exists")
    const created = ex.executeQuery('CREATE TABLE authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);');
    expect(created.success).toBe(true);
    const state = ex.getDatabaseState();
    expect(state.schemas['authors'].columns.some((c: any) => c.primaryKey)).toBe(true);
  });

  it('explicit CREATE TABLE registers schema so SELECT * behaves like seeded tables', () => {
    const ex = setup();
    ex.executeQuery("INSERT INTO publishers (name) VALUES ('One');");
    const r = ex.executeQuery('SELECT * FROM publishers;');
    // SELECT * expands raw keys + prefixed keys engine-wide (same shape as a
    // seeded table) — the point is parity: created tables resolve identically.
    const cols = r.columns as string[];
    expect([...cols].sort()).toEqual(
      ['publisher_id', 'name', 'publishers.publisher_id', 'publishers.name'].sort()
    );
    expect(r.rows[0].publisher_id).toBe(1);
    expect(r.rows[0].name).toBe('One');
  });
});