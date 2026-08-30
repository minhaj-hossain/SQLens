import { SqlExecutor } from '../src/lib/sql-engine/executor';

const ex = new SqlExecutor();
function q(sql: string) {
  const r = ex.executeQuery(sql);
  console.log('--- ' + sql.split('\n')[0].slice(0, 70));
  if (!r.success) {
    console.log('ERR', r.error);
    return r;
  }
  console.log('cols', r.columns, 'rowCount', r.rowCount, 'affected', r.affectedRows, 'rows', JSON.stringify(r.rows));
  return r;
}
function booksLen(label: string) {
  const db = ex.getDatabaseState();
  console.log(label, 'books len', db.tables['books']?.length, 'authors len', db.tables['authors']?.length, 'publishers len', db.tables['publishers']?.length);
}

q('DROP TABLE IF EXISTS sales;');
q('DROP TABLE IF EXISTS books;');
q('DROP TABLE IF EXISTS authors;');
q('DROP TABLE IF EXISTS publishers;');
q("CREATE TABLE publishers (publisher_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE);");
q("CREATE TABLE authors (author_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);");
q("CREATE TABLE books (book_id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(200) NOT NULL, author_id INT NOT NULL, publisher_id INT NOT NULL, genre VARCHAR(50) NOT NULL, price DECIMAL(8,2) NOT NULL CHECK (price >= 0), quantity_in_stock INT NOT NULL DEFAULT 0, FOREIGN KEY (author_id) REFERENCES authors(author_id), FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id));");
q("CREATE TABLE sales (sale_id INT PRIMARY KEY AUTO_INCREMENT, book_id INT NOT NULL, sale_date DATE NOT NULL, quantity INT NOT NULL CHECK (quantity > 0), unit_price DECIMAL(8,2) NOT NULL, FOREIGN KEY (book_id) REFERENCES books(book_id));");
booksLen('after create  ');
q("ALTER TABLE books ADD COLUMN status VARCHAR(20) DEFAULT 'active';");
booksLen('after alter    ');
q("INSERT INTO publishers (name) VALUES ('Hachette'), ('Scholastic');");
q("INSERT INTO authors (name) VALUES ('John Doe'), ('Jane Roe');");
q("INSERT INTO books (title, author_id, publisher_id, genre, price, quantity_in_stock) VALUES ('Learning SQL', 1, 1, 'Programming', 19.99, 5), ('SQL Deep Dive', 2, 2, 'Programming', 24.99, 0);");
q("INSERT INTO sales (book_id, sale_date, quantity, unit_price) VALUES (1, '2026-08-10', 2, 19.99), (2, '2026-08-15', 1, 24.99);");
booksLen('after insert   ');
console.log('books rows', JSON.stringify(ex.getDatabaseState().tables['books']));
q('SELECT * FROM books;');
q("SELECT b.title, a.name AS author, p.name AS publisher, b.status FROM books b JOIN authors a ON b.author_id = a.author_id JOIN publishers p ON b.publisher_id = p.publisher_id ORDER BY b.book_id;");
q("SELECT book_id, title, author_id, publisher_id FROM books WHERE genre = 'Programming';");